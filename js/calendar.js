document.addEventListener('DOMContentLoaded', function () {
    // Текущая дата
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    // Элементы DOM
    const monthSelector = document.getElementById('month-selector');
    const yearSelector = document.getElementById('year-selector');
    const calendarDays = document.getElementById('calendar-days');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const addEventModal = document.getElementById('add-event-modal');
    const dayEventsModal = document.getElementById('day-events-modal');
    const addEventForm = document.getElementById('add-event-form');
    const dayEventsTitle = document.getElementById('day-events-title');
    const dayEventsList = document.getElementById('day-events-list');
    const addNewEventBtn = document.getElementById('add-new-event');
    const eventDateInput = document.getElementById('event-date');
    const closeEventsModalBtn = document.getElementById('close-events-modal');

    // Закрытие модальных окон
    const closeModalButtons = document.querySelectorAll('.close-modal');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function () {
            addEventModal.style.display = 'none';
            dayEventsModal.style.display = 'none';
        });
    });

    // Обработчик закрытия модального окна событий
    closeEventsModalBtn.addEventListener('click', function() {
        dayEventsModal.style.display = 'none';
    });

    // Хранилище событий
    let events = JSON.parse(localStorage.getItem('calendarEvents')) || [];

    // Инициализация календаря
    function initCalendar() {
        // Заполнение списка годов (10 лет назад и 10 лет вперед)
        const currentYear = new Date().getFullYear();
        for (let i = currentYear - 10; i <= currentYear + 10; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            yearSelector.appendChild(option);
        }

        // Установка текущего месяца и года
        monthSelector.value = currentMonth;
        yearSelector.value = currentYear;

        // Обработчики изменения месяца и года
        monthSelector.addEventListener('change', function () {
            currentMonth = parseInt(this.value);
            renderCalendar(currentMonth, currentYear);
        });

        yearSelector.addEventListener('change', function () {
            currentYear = parseInt(this.value);
            renderCalendar(currentMonth, currentYear);
        });

        renderCalendar(currentMonth, currentYear);

        // Навигация
        prevMonthBtn.addEventListener('click', function () {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
                yearSelector.value = currentYear;
            }
            monthSelector.value = currentMonth;
            renderCalendar(currentMonth, currentYear);
        });

        nextMonthBtn.addEventListener('click', function () {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
                yearSelector.value = currentYear;
            }
            monthSelector.value = currentMonth;
            renderCalendar(currentMonth, currentYear);
        });

        // Добавление нового события
        addNewEventBtn.addEventListener('click', function () {
            dayEventsModal.style.display = 'none';
            addEventModal.style.display = 'flex';
        });

        // Обработка формы добавления события
        addEventForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const title = document.getElementById('event-title').value;
            const description = document.getElementById('event-description').value;
            const date = eventDateInput.value;

            const newEvent = {
                id: Date.now(),
                title,
                description,
                date
            };

            events.push(newEvent);
            saveEvents();
            renderCalendar(currentMonth, currentYear);

            // Очистка формы
            addEventForm.reset();
            addEventModal.style.display = 'none';
        });
    }

    // Рендер календаря
    function renderCalendar(month, year) {
        // Очистка календаря
        calendarDays.innerHTML = '';

        // Первый день месяца
        const firstDay = new Date(year, month, 1);
        // Последний день месяца
        const lastDay = new Date(year, month + 1, 0);
        // День недели первого дня месяца
        const firstDayIndex = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
        // День недели последнего дня месяца
        const lastDayIndex = lastDay.getDay() === 0 ? 6 : lastDay.getDay() - 1;
        // Количество дней в предыдущем месяце
        const prevLastDay = new Date(year, month, 0).getDate();
        // Количество дней в текущем месяце
        const daysInMonth = lastDay.getDate();
        // Количество дней в следующем месяце для отображения
        const nextDays = 7 - lastDayIndex - 1;

        // Ячейки предыдущего месяца
        for (let i = firstDayIndex; i > 0; i--) {
            const day = prevLastDay - i + 1;
            const dateStr = formatDate(new Date(year, month - 1, day));
            const dayElement = createDayElement(day, dateStr, true);
            calendarDays.appendChild(dayElement);
        }

        // Ячейки текущего месяца
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const dateStr = formatDate(date);
            const isToday = isSameDay(date, new Date());
            const dayElement = createDayElement(i, dateStr, false, isToday);

            // Добавление событий дня
            const dayEvents = getEventsForDate(dateStr);
            if (dayEvents.length > 0) {
                const eventsContainer = document.createElement('div');
                dayEvents.forEach(event => {
                    const eventElement = document.createElement('div');
                    eventElement.classList.add('event');
                    eventElement.textContent = event.title;
                    eventElement.title = event.description || event.title;
                    eventElement.addEventListener('click', (e) => {
                        e.stopPropagation();
                        viewEventDetails(event);
                    });
                    eventsContainer.appendChild(eventElement);
                });
                dayElement.appendChild(eventsContainer);
            }

            calendarDays.appendChild(dayElement);
        }

        // Ячейки следующего месяца
        for (let i = 1; i <= nextDays; i++) {
            const dateStr = formatDate(new Date(year, month + 1, i));
            const dayElement = createDayElement(i, dateStr, true);
            calendarDays.appendChild(dayElement);
        }
    }

    // Создание элемента дня
    function createDayElement(dayNumber, dateStr, isOtherMonth, isToday = false) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        if (isOtherMonth) dayElement.classList.add('other-month');
        if (isToday) dayElement.classList.add('today');

        const dayNumberElement = document.createElement('div');
        dayNumberElement.classList.add('day-number');
        dayNumberElement.textContent = dayNumber;
        dayElement.appendChild(dayNumberElement);

        dayElement.addEventListener('click', function () {
            openDayEventsModal(dateStr);
        });

        return dayElement;
    }

    // Открытие модального окна событий дня
    function openDayEventsModal(dateStr) {
        const date = parseDate(dateStr);
        const formattedDate = formatDisplayDate(date);
        dayEventsTitle.textContent = `События ${formattedDate}`;

        // Установка даты для добавления нового события
        eventDateInput.value = dateStr;

        // Очистка списка событий
        dayEventsList.innerHTML = '';

        // Получение событий для выбранной даты
        const dayEvents = getEventsForDate(dateStr);

        if (dayEvents.length === 0) {
            const noEvents = document.createElement('div');
            noEvents.textContent = 'Нет событий на этот день';
            dayEventsList.appendChild(noEvents);
        } else {
            dayEvents.forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.classList.add('event-item');

                const eventInfo = document.createElement('div');
                eventInfo.classList.add('event-info');

                const eventTitle = document.createElement('div');
                eventTitle.textContent = event.title;
                eventTitle.style.fontWeight = 'bold';
                eventTitle.style.marginBottom = '5px';

                eventInfo.appendChild(eventTitle);

                const eventActions = document.createElement('div');
                eventActions.classList.add('event-actions');

                const deleteBtn = document.createElement('button');
                deleteBtn.classList.add('btn', 'btn-danger');
                deleteBtn.textContent = 'Удалить';
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteEvent(event.id);
                });

                eventActions.appendChild(deleteBtn);

                eventItem.appendChild(eventInfo);
                eventItem.appendChild(eventActions);

                eventItem.addEventListener('click', () => {
                    viewEventDetails(event);
                });

                dayEventsList.appendChild(eventItem);
            });
        }

        dayEventsModal.style.display = 'flex';
    }

    // Просмотр деталей события
    function viewEventDetails(event) {
        dayEventsModal.style.display = 'none';

        const modalContent = `
                    <div class="modal-header">
                        <h3 class="modal-title">${event.title}</h3>
                    </div>
                    <div style="padding: 20px;">
                        <p><strong>Дата:</strong> ${formatDisplayDate(parseDate(event.date))}</p>
                        ${event.description ? `<p><strong>Описание:</strong> ${event.description}</p>` : ''}
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary close-modal">Закрыть</button>
                        <button type="button" class="btn btn-danger" id="delete-event-btn">Удалить событие</button>
                    </div>
                `;

        const tempModal = document.createElement('div');
        tempModal.classList.add('modal');
        tempModal.style.display = 'flex';
        tempModal.innerHTML = `
                    <div class="modal-content">
                        ${modalContent}
                    </div>
                `;

        document.body.appendChild(tempModal);

        tempModal.querySelector('.close-modal').addEventListener('click', () => {
            tempModal.remove();
        });

        tempModal.querySelector('#delete-event-btn').addEventListener('click', () => {
            deleteEvent(event.id);
            tempModal.remove();
            renderCalendar(currentMonth, currentYear);
        });
    }

    // Удаление события
    function deleteEvent(eventId) {
        events = events.filter(event => event.id !== eventId);
        saveEvents();
        renderCalendar(currentMonth, currentYear);
        dayEventsModal.style.display = 'none';
    }

    // Получение событий для указанной даты
    function getEventsForDate(dateStr) {
        return events.filter(event => event.date === dateStr);
    }

    // Сохранение событий в localStorage
    function saveEvents() {
        localStorage.setItem('calendarEvents', JSON.stringify(events));
    }

    // Форматирование даты в строку YYYY-MM-DD
    function formatDate(date) {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    // Парсинг строки даты в объект Date
    function parseDate(dateStr) {
        const parts = dateStr.split('-');
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    // Форматирование даты для отображения
    function formatDisplayDate(date) {
        const options = { day: 'numeric', month: 'long' };
        return date.toLocaleDateString('ru-RU', options);
    }

    // Проверка, совпадают ли даты (без времени)
    function isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    }

    // Инициализация календаря
    initCalendar();
});