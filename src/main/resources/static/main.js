// текущий вид отображения информации таблица/карточки
let currentView = 'table'

// текущая строка поиска
let searchString = ''

// сколько всего страниц доступно
let totalPages = 0

// текущая страница
let currentPage = 0

// сколько элементов отображается на странице
let itemsPerPage = 10

// кнопка добавления студента в таблицу
const addStudentButton = document.querySelector('.main__students__add')

// элемент в котором рисуется пагинация
const pagination = document.querySelector('.pagination')

// инпут поиска
const searchInput = document.querySelector('.main__input')

// по умолчанию не выбран никакой подфильтр
let currentSubfilter = null

// массив в котором хранится вся информация о студентах на странице
let students = []

// объект для отрисовки данных студентов
const dataObject = {
    dataComponent: document.querySelector('.main__students__data'),
    dataComponentHeader: document.querySelector('.main__students__row_header'),
    dataEmptyComponent: document.querySelector('.main__students__empty'),
    dataButtonsWrapper: document.querySelector('.main__students__buttons'),
    dataButtonsEdit: [...document.querySelectorAll('.main__students__buttons__item_edit')],
    dataButtonsRemove: [...document.querySelectorAll('.main__students__buttons__item_remove')],
}

// объект для смены цветовой темы со светлой на темную и обратно
const lightSwitchObject = {
    lightSwitch: document.querySelector('.main__light-switch'),
    lightSwitchImages: [...document.querySelectorAll('.main__light-switch svg')],
}

// объект для смены видов отображения информации карточка/таблица
const viewSwitchObject = {
    viewSwitch: document.querySelector('.main__view-switch'),
    viewSwitchImages: [...document.querySelectorAll('.main__view-switch svg')],
}

// объект для отображения модального окна с инструкцией
const rulesPopupObject = {
    rulesButton: document.querySelector('.main__rules'),
    rulesPopup: document.querySelector('.popup__rules'),
    rulesPopupContent: document.querySelector('.popup__rules__content'),
    rulesPopupBackground: document.querySelector('.popup__rules__background'),
    rulesPopupClose: document.querySelector('.popup__rules__close'),
}

// объект для отображения модального окна удаления студента
const removeObject = {
    removePopup: document.querySelector('.popup__remove'),
    removePopupContent: document.querySelector('.popup__remove__content'),
    removePopupBackground: document.querySelector('.popup__remove__background'),
    removePopupClose: document.querySelector('.popup__remove__close'),
    removePopupData: document.querySelector('.popup__remove__data'),
    removePopupConfirm: document.querySelector('.popup__remove__confirm'),
    removePopupDecline: document.querySelector('.popup__remove__decline')
}

// объект для отображения модального окна редактирования или добавления карточки студента
const editPopupObject = {
    editButton: document.querySelector('.popup__edit__button-edit'),
    editPopup: document.querySelector('.popup__edit'),
    editPopupContent: document.querySelector('.popup__edit__content'),
    editPopupBackground: document.querySelector('.popup__edit__background'),
    editSaveButton: document.querySelector('.popup__edit__button-save'),
    editDropdown: document.querySelector('.popup__edit__dropdown__content'),
    editDropdownOptionsWrapper: document.querySelector('.popup__edit__dropdown__wrapper'),
    editDropdownOptions: [...document.querySelectorAll('.popup__edit__dropdown p')],
    editDropdownData: document.querySelector('.popup__edit__dropdown__data'),
    editClose: document.querySelector('.popup__edit__close'),
    editPopupData: [...document.querySelectorAll('.popup__edit__row__data')],
    editPopupTitle: document.querySelector('.popup__edit__title'),
}

// объект для отображения ошибок при добавлении или редактировании карточки студента
const errorsObject = {
    studentCardError: document.querySelector('.popup__edit__error_student-card'),
    studentRoomError: document.querySelector('.popup__edit__error_room'),
    studentRoomErrorText: document.querySelector('.popup__edit__error_room .popup__edit__error__content'),
}

// объект для взаимодействия с выпадающим списком "Фильтры"
const filterObject = {
    filterButton: document.querySelector('.main__filter__wrapper'),
    filterDropdown: document.querySelector('.main__filter__dropdown__container'),
    filterOptions: document.querySelector('.main__filter__dropdown'),
}

// объект для взаимодествия с подфильтрами
const subfilterObject = {
    subfilterButtonWrapper: document.querySelector('.main__subfilter'),
    subfilterButton: document.querySelector('.main__subfilter__container'),
    subfilterButtonText: document.querySelector('.main__subfilter__text'),
    subfilterDropdown: document.querySelector('.main__subfilter__dropdown__container'),
    subfilterDropdownOptions: document.querySelector('.main__subfilter__dropdown'),
}

// объект для взаимодействия с выпадающим списком "Показать по", управляющим отображением
// количества студентов на странице
const showByObject = {
    showByButtonWrapper: document.querySelector('.main__students__show-by__data__wrapper'),
    showByButtonData: document.querySelector('.main__students__show-by__data'),
    showByDropdown: document.querySelector('.main__students__show-by__dropdown'),
    showByTriangle: document.querySelector('.main__students__show-by__triangle'),
    showByDropdownOptions: document.querySelector('.main__students__show-by__dropdown__content'),
}

// объект, содержащий информацию для отправки запроса фильтрации данных на сервер
/* "Name": { - ключ Name должен совпадать с <p>Name</p> в index.html в выпадающем списке фильтров
        method: '/api/students/nameMethod' - куда отправлять запрос,
        options: [] - возможные значения для выпадающего списка подфильтров.
                      Можно запрашивать с сервера или указывать явно
        currentFilter: '', - текущее значение подфильтра для отображения в html,
        param: 'Name' - поле нужно для понимания при попытке отправить запрос,
                        нужно ли отправлять запрос или обработать его локально
    }*/
const subfilterOptions = {
    'Группа': {
        method: '/api/students/group',
        options: [],
        currentFilter: '',
        param: 'group'
    },
    'Комната': {
        method: '/api/students/room',
        options: [],
        currentFilter: '',
        param: 'room'
    },
    // Подфильтр "Оплатил" не требует отправки запроса на сервер, фильтрация происходит на клиенте
    'Оплатил': {
        method: null,
        options: ['да', 'нет'],
        currentFilter: '',
        param: 'paid'
    },
    // Опция для сброса всех фильтров
    'Очистить': null
}

// проверяем, есть ли в localStorage тема и если нет, то устанавливаем тему по умолчанию
if (!localStorage.getItem("theme")) {
    localStorage.setItem("theme", "light")
} else {
    changeLight(localStorage.getItem("theme"))
}

// проверяем, есть ли в localStorage режим отображения информации и если нет,
// то устанавливаем режим отображения информации по умолчанию
if (!localStorage.getItem("view")) {
    localStorage.setItem("view", "table")
} else {
    changeView(localStorage.getItem("view"))
}

// обнуляем данные для отображения новых


dataObject.dataComponent.innerHTML = ''
dataObject.dataButtonsWrapper.innerHTML = ''

// при загрузке страницы получаем данные о студентах с сервера
await getStudents('/api/students')
// рисуем пагинацию на странице
drawPagination(currentPage, totalPages)
// перерисовываем страницу с новыми данными
redrawTable(students)
// переназаначаем события для кнопок редактирования и удаления студента
reassignButtons()

const debouncedHandleInput = debounce(handleInput, 300);
// отслеживаем ввод текста в поле поиска
searchInput.addEventListener('input', async () => {
    searchString = event.target.value
    // при вводе текста отправляется запрос на сервер с
    // текущей строкой поиска, текущим подфильтром, текущим номером страницы
    // и количеством студентов на странице, которое должно отображаться
    debouncedHandleInput()

    // перерисовываем страницу с новыми данными
    redrawTable(students)
    // переназаначаем события для кнопок редактирования и удаления студента
    reassignButtons()
})

async function handleInput() {
    searchString = searchInput.value;
    await getStudents(
        '/api/students',
        {
            keyword: searchString,
            filter: currentSubfilter,
            page: currentPage,
            showBy: itemsPerPage
        }
    );
    redrawTable(students);
    reassignButtons();
}


// отслеживаем нажатие на кнопку смены темы
lightSwitchObject.lightSwitch.addEventListener('click', () => {
    // если изображение полумесяца не активно, то значит нужно сменить тему на темную
    if (lightSwitchObject.lightSwitchImages[1].classList.contains('main__light-switch--disabled')) {
        changeLight('dark')
        // сохраняем в localStorage тему по умолчанию, чтобы при перезагрузки страницы она сохранилась
        localStorage.setItem('theme', 'dark')
        // иначе переключаемся на светлую тему
    } else {
        changeLight('light')
        localStorage.setItem('theme', 'light')
    }
})

// отслеживаем нажатие на кнопку смены режима отображения информации о студентах
viewSwitchObject.viewSwitch.addEventListener('click', () => {
    // если изображение таблицы не активно, то значит нужно сменить режим отображения на таблицу
    if (viewSwitchObject.viewSwitchImages[1].classList.contains('main__view-switch--disabled')) {
        changeView('table')
        // сохраняем в localStorage режим отображения по умолчанию,
        // чтобы при перезагрузки страницы он сохранился
        localStorage.setItem('view', 'table')
        // иначе режим отображения переключается на карточки
    } else {
        changeView('cards')
        localStorage.setItem('view', 'cards')
    }

    // перерисовываем страницу со старыми данными, но другим отображением
    redrawTable(students)
    // переназначаем кнопки редактирования и удаления карточки студента
    reassignButtons()
})


// отслеживаем нажатие на кнопку открытия справки
rulesPopupObject.rulesButton.onclick = () => {
    toggleRulesPopup()
}

// отслеживаем нажатие на фон модального окна справки для его закрытия
rulesPopupObject.rulesPopupBackground.onclick = () => {
    toggleRulesPopup()
}

// отслеживаем нажатие на кнопку закрытия модального окна справки
rulesPopupObject.rulesPopupClose.onclick = () => {
    toggleRulesPopup()
}

// отслеживаем нажатие на кнопку закрытия модального окна редактирования карточки
editPopupObject.editClose.onclick = async () => {
    await toggleEditPopup()
}

// отслеживаем нажатие на фон модального окна удаления карточки для его закрытия
removeObject.removePopupBackground.onclick = async () => {
    await toggleRemovePopup()
}

// отслеживаем нажатие на кнопку "Отменить" модального окна удаления карточки
removeObject.removePopupDecline.onclick = async () => {
    await toggleRemovePopup()
}

// отслеживаем нажатие на кнопку закрытия модального окна удаления карточки
removeObject.removePopupClose.onclick = async () => {
    await toggleRemovePopup()
}

// отслеживаем нажатие на кнопку добавления студента
addStudentButton.onclick = () => {
    toggleEditPopup(null)
}

// отслеживаем нажатие на кнопки перехода по страницам
pagination.addEventListener('click', async (event) => {
    if (event.target !== event.currentTarget) {
        // с сервера возвращаются страницы от 0, поэтому отнимаем единицу
        currentPage = event.target.innerHTML - 1
        // получаем с сервера студентов с конкретной страницы
        await getStudents(
            '/api/students',
            {
                keyword: searchString,
                filter: currentSubfilter,
                page: currentPage,
                showBy: itemsPerPage
            }
        )
        redrawTable(students)
        reassignButtons()
    }
})

// отслеживаем нажатие на кнопку "Фильтры"
// и открываем/закрываем выпадающий список
filterObject.filterButton.onclick = () => {
    filterObject.filterButton.classList.toggle('main__filter__wrapper--opened')
    filterObject.filterDropdown.classList.toggle('main__filter__dropdown__container--opened')
}

// отслеживаем нажатие на опцию выпадающего списка
filterObject.filterOptions.onclick = async (e) => {
    // закрываем выпадающий список
    filterObject.filterDropdown.classList.toggle('main__filter__dropdown__container--opened')
    filterObject.filterButton.classList.toggle('main__filter__wrapper--opened')

    // если значение выбранной опции null, то тогда сбрасываем фильтры и убираем кнопку подфильтров
    if (subfilterOptions[e.target.innerHTML] === null) {
        subfilterObject.subfilterButton.classList.remove('main__subfilter--active')
        subfilterObject.subfilterButtonText.innerHTML = ''
        subfilterObject.subfilterButtonWrapper.style.display = 'none'

        // сбрасываем значение текущего фильтра
        currentSubfilter = null

        // получаем всех студентов
        await getStudents('/api/students', { showBy: itemsPerPage })
        redrawTable(students)
        reassignButtons()
    } else {
        // показываем кнопку подфильтров
        subfilterObject.subfilterButtonWrapper.style.display = 'block'

        // задержка для воспроизведения анимации появления кнопки подфильтров
        setTimeout(() => {
            subfilterObject.subfilterButton.classList.add('main__subfilter--active')
        }, 10)

        // запрашиваем студентов заново на случай, если ранее был выбран какой-то другой подфильтр
        await getStudents('/api/students', { showBy: itemsPerPage })
        redrawTable(students)
        reassignButtons()

        // если подфильтр не выполняется локально, то запрашиваем опции для него с сервера
        if (subfilterOptions[e.target.innerHTML].method) {
            subfilterOptions[e.target.innerHTML].options =
                await (await fetch(subfilterOptions[e.target.innerHTML].method, { method: 'GET' })).json()
        }

        // текущий объект подфильтра
        currentSubfilter = subfilterOptions[e.target.innerHTML]

        // обнуляем содержимое выпадающего списка подфильтров
        subfilterObject.subfilterDropdownOptions.innerHTML = ''

        // добавляем из объекта подфильтра опции в выпадающий список
        currentSubfilter.options.forEach(e => {
            subfilterObject.subfilterDropdownOptions.insertAdjacentHTML("beforeend", `<p>${e}</p>`)
        })

        // меняем текст кнопки подфильтров на текущий подфильтр
        subfilterObject.subfilterButtonText.innerHTML = e.target.innerHTML
    }

    // закрываем выпадающий список подфильтров, если он ранее был открыт
    subfilterObject.subfilterDropdown.classList.remove('main__subfilter__dropdown__container--opened')
}

// отслеживаем нажатие на кнопку подфильтров
// и открываем выпадающий список подфильтров
subfilterObject.subfilterButton.onclick = () => {
    subfilterObject.subfilterDropdown.classList.toggle('main__subfilter__dropdown__container--opened')
}

// отслеживаем нажатие на опции выпадающего списка подфильтров
subfilterObject.subfilterDropdownOptions.onclick = async (e) => {
    // меняем текст кнопки подфильтров на выбранную опцию и закрываем выпадающий список
    subfilterObject.subfilterDropdown.classList.toggle('main__subfilter__dropdown__container--opened')
    currentSubfilter.currentFilter = e.target.innerHTML
    subfilterObject.subfilterButtonText.innerHTML = e.target.innerHTML

    // получаем список студентов отфильтрованных по значению подфильтра
    await getStudents(
        '/api/students',
        {
            filter: currentSubfilter,
            showBy: itemsPerPage
        }
    )
    redrawTable(students)
    reassignButtons()
}

// отслеживаем нажатие на кнопку показа количества студентов на странице
// и открываем выпадающий список
showByObject.showByButtonWrapper.onclick = () => {
    showByObject.showByDropdown.classList.toggle('main__students__show-by__dropdown--opened')
    showByObject.showByTriangle.classList.toggle('main__students__show-by__triangle--rotated')
}

// отслеживаем нажатие на опции выпадающего списка показа количества студентов на странице
showByObject.showByDropdownOptions.addEventListener('click', async (event) => {
    if (event.target !== event.currentTarget) {
        // изменяем текст кнопки, переменную отвечающую за текущее количество студентов
        // на выбранную опцию и закрываем выпадающий список
        showByObject.showByButtonData.innerHTML = event.target.innerHTML
        itemsPerPage = event.target.innerHTML
        showByObject.showByDropdown.classList.toggle('main__students__show-by__dropdown--opened')
        showByObject.showByTriangle.classList.toggle('main__students__show-by__triangle--rotated')

        // получаем новый список студентов с сервера с обновленным количеством студентов на странице
        await getStudents(
            '/api/students',
            {
                keyword: searchString,
                filter: currentSubfilter,
                page: currentPage,
                showBy: itemsPerPage
            }
        )
        redrawTable(students)
        reassignButtons()
    }
})

// отслеживаем нажатие на кнопку "Редактировать" в карточке студента
editPopupObject.editButton.onclick = () => {
    // разблокируем поля для редактирования и кнопку "Сохранить"
    editPopupObject.editPopup.classList.remove('popup__edit__row__data--disabled')
    editPopupObject.editSaveButton.classList.remove('popup__edit__buttons--disabled')
    editPopupObject.editButton.classList.add('popup__edit__buttons--disabled')
}

// не разрешаем пользователю вводить буквы в поле номера комнаты в карточке студента
editPopupObject.editPopupData[4].onkeydown = () => {
    if (isNaN(event.key) && event.key !== 'Backspace' && event.key !== 'Tab') {
        event.preventDefault();
    }
}

// отслеживаем нажатие на кнопку выпадающего списка в карточке студента
editPopupObject.editDropdown.onclick = () => {
    editPopupObject.editDropdownOptionsWrapper.classList.toggle('popup__edit__dropdown__wrapper--opened')
}

// отслеживаем нажатие на опции выпадающего списка в карточке студента
editPopupObject.editDropdownOptions.forEach(e => {
    e.onclick = () => {
        editPopupObject.editDropdownData.innerHTML = event.target.innerHTML
        editPopupObject.editDropdownOptionsWrapper.classList.toggle('popup__edit__dropdown__wrapper--opened')
    }
})

// функция открытия и закрытия модального окна удаления студента
async function toggleRemovePopup(id) {
    // находим студента по его id в массиве students
    const removePerson = students.filter(e => e.id === +id)[0]

    // если фон модального окна не содержит класс, отвечающий за его открытие,
    // то открываем модальное окно
    if (!removeObject.removePopupBackground.classList.contains('popup__background--active')) {
        removeObject.removePopup.style.display = 'block'

        // задержка для воспроизведения анимации открытия модального окна
        setTimeout(() => {
            removeObject.removePopupBackground.classList.add('popup__background--active')
            removeObject.removePopupContent.classList.add('popup__content--active')
        }, 10)

        removeObject.removePopupData.innerHTML =
            `«${removePerson.lastName} ${removePerson.firstName} ${removePerson.patronymic}»`

    } else {
        removeObject.removePopupBackground.classList.remove('popup__background--active')
        removeObject.removePopupContent.classList.remove('popup__content--active')

        setTimeout(() => {
            removeObject.removePopup.style.display = 'none'
        }, 300)
    }

    // отслеживаем нажатие на кнопку "ДА" в модальном окне удаления студента
    removeObject.removePopupConfirm.onclick = () => {
        // отправляем запрос на сервер
        removeItemFromTable(id)
        // закрываем модальное окно
        toggleRemovePopup(id)
    }
}

// функция для отправки запроса на удаление студента на сервер
async function removeItemFromTable(id) {

    const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE'
    })

    // получаем данные обновленного списка студентов без удаленного студента
    await getStudents(
        '/api/students',
        {
            keyword: searchString,
            filter: currentSubfilter,
            page: currentPage,
            showBy: itemsPerPage
        }
    )
    redrawTable(students)
    reassignButtons()
}

// функция открытия и закрытия модального окна редактирования карточки студента
// если id null, то открывается карточка с пустыми полями для создания нового студента
async function toggleEditPopup(id = null) {
    let currentPerson = await getCurrentPersonInfo(id)
    // переменные для сохранения старого номера
    // студенческого билета и номера комнаты
    let oldStudentCard = null
    let oldStudentRoom = null


    // если фон модального окна не содержит класс, отвечающий за его открытие,
    // то открываем модальное окно
    if (!editPopupObject.editPopupBackground.classList.contains('popup__background--active')) {
        editPopupObject.editPopup.style.display = 'block'

        // подстваляем в значения input соответствующую информацию о студенте
        editPopupObject.editPopupData[0].value = currentPerson.lastName
        editPopupObject.editPopupData[1].value = currentPerson.firstName
        editPopupObject.editPopupData[2].value = currentPerson.patronymic
        editPopupObject.editPopupData[3].value = currentPerson.groupNum
        editPopupObject.editPopupData[4].value = currentPerson.room
        editPopupObject.editPopupData[5].value = currentPerson.studentCard
        editPopupObject.editPopupData[6].value = currentPerson.phone

        editPopupObject.editDropdownData.innerHTML = currentPerson.paid ? 'да' : 'нет'
        oldStudentCard = currentPerson.studentCard
        oldStudentRoom = currentPerson.room

        setTimeout(() => {
            editPopupObject.editPopupBackground.classList.add('popup__background--active')
            editPopupObject.editPopupContent.classList.add('popup__content--active')
        }, 10)

    } else {
        //закрываем модальное окно и закрываем сообщения об ошибках
        editPopupObject.editPopupBackground.classList.remove('popup__background--active')
        editPopupObject.editPopupContent.classList.remove('popup__content--active')
        editPopupObject.editPopup.classList.add('popup__edit__row__data--disabled')
        editPopupObject.editSaveButton.classList.add('popup__edit__buttons--disabled')
        editPopupObject.editButton.classList.remove('popup__edit__buttons--disabled')
        editPopupObject.editButton.classList.remove('popup__edit__buttons--unshown')
        editPopupObject.editPopupData.forEach((field) => field.classList.remove('popup__edit__row__data--error'))
        errorsObject.studentCardError.classList.remove('popup__edit__error--opened')
        errorsObject.studentRoomError.classList.remove('popup__edit__error--opened')

        setTimeout(() => {
            editPopupObject.editPopup.style.display = 'none'
        }, 300)
    }

    // отслеживаем нажатие на кнопку "Сохранить"
    editPopupObject.editSaveButton.onclick = async () => {
        // проверяем заполенны ли поля
        const error = checkFields(editPopupObject.editPopupData)

        // если нам не вернулась ошибка и id не null, то отправляем запрос
        // на редактирование студента
        if (!error && id) {
            const response = await changeOrAddStudent(
                `/api/students/${id}`,
                'PUT',
                editPopupObject.editPopupData,
                editPopupObject.editDropdownData,
                oldStudentCard,
                oldStudentRoom
            )
            // обработка возможных ошибок, вернувшихся с сервера
            handleEditPopupErrors(response)
            // если нам не вернулась ошибка и id равно null, то отправляем запрос
            // на создание нового студента
        } else if (!error && id === null) {
            const response = await changeOrAddStudent(
                `/api/students/add`,
                'POST',
                editPopupObject.editPopupData,
                editPopupObject.editDropdownData
            )

            handleEditPopupErrors(response)

            // если запрос прошел успешно, то закрываем модальное окно
            if (response === true) {
                toggleEditPopup()
            }
        }
    }
}

// функция для получения информации о студенте, если id не null
// если id null, то возвращается объект с пустыми полями
async function getCurrentPersonInfo(id) {
    let currentPerson = {}

    // если id null, то очищаем поля вваода
    if (id === null) {
        currentPerson = {
            lastName: '',
            firstName: '',
            patronymic: '',
            groupNum: '',
            room: '',
            studentCard: '',
            phone: '',
            paid: false
        }

        // меняем заголовок модального окна, скрываем кнопку "Редактировать" и разрешаем редактирование полей
        editPopupObject.editPopupTitle.innerHTML = 'Добавить студента'
        editPopupObject.editPopup.classList.remove('popup__edit__row__data--disabled')
        editPopupObject.editSaveButton.classList.remove('popup__edit__buttons--disabled')
        editPopupObject.editButton.classList.add('popup__edit__buttons--unshown')
    } else {
        // если id не null, тогда отображаем заголовок для редактирования
        editPopupObject.editPopupTitle.innerHTML = 'Редактирование карточки студента'

        // получаем всю информацию о студенте с сервера
        const response = await fetch(`/api/students/${id}`, {
            method: "GET"
        })

        // сохраняем студента в переменную
        currentPerson = await response.json()
    }

    return currentPerson
}

// обработка возможных ошибок вернувшихся с сервера
// если возникла ошибка, то отображаем ее
function handleEditPopupErrors(error) {
    // ошибка, если номер студенческого билета уже существует в базе
    if (error === 'StudentIdExists') {
        errorsObject.studentCardError.classList.add('popup__edit__error--opened')
    }

    // ошибка, если команта в которую хотят записать студента уже переполненна
    if (error === 'RoomIsFull') {
        errorsObject.studentRoomError.classList.add('popup__edit__error--opened')
        errorsObject.studentRoomErrorText.innerHTML = '<p>В данной комнате нет свободных мест!</p>'
        // ошибка, если комната в которую хотят записать студента не существует
    } else if (error === 'RoomDoesNotExist') {
        errorsObject.studentRoomError.classList.add('popup__edit__error--opened')
        errorsObject.studentRoomErrorText.innerHTML = '<p>Такой комнаты не существует!</p>'
    }
}

// функция для проверки пустых полей при создании или редактировании
// карточки студента
function checkFields(fieldsData) {
    let error = false
    fieldsData.forEach((field) => {
        // если значение инпута равно пустой строке, то отображаем ошибку
        // пробелы из строки удаляются
        if (field.value.replaceAll(' ', '') === '') {
            field.classList.add('popup__edit__row__data--error')
            error = true
        } else {
            field.classList.remove('popup__edit__row__data--error')
        }
    })

    // закрываем старые ошибки, которые могли вернуться с сервера
    errorsObject.studentCardError.classList.remove('popup__edit__error--opened')
    errorsObject.studentRoomError.classList.remove('popup__edit__error--opened')
    return error
}

// функция для отправки запроса на добавление или изменения студента на сервер
async function changeOrAddStudent(
    endpoint,
    method,
    data,
    dropdownData,
    oldStudentCard = null,
    oldStudentRoom = null
) {
    // отправляем запрос на добавление или изменение студента (endpoint)
    const response = await fetch(endpoint, {
        // метод запроса
        method: method,
        // указываем, что отправляем JSON
        headers: {
            'Content-Type': 'application/json'
        },
        // тело запроса
        body: JSON.stringify({
            lastName: data[0].value,
            firstName: data[1].value,
            patronymic: data[2].value,
            groupNum: data[3].value,
            // если старая комната не равна новой, то отправляем новую
            room: !oldStudentRoom ? +data[4].value : +oldStudentRoom === +data[4].value ? null : +data[4].value,
            // если старый номер студенческого билета не равен новому, то отправляем новый
            studentCard: !oldStudentCard ? data[5].value : oldStudentCard === data[5].value ? null : data[5].value,
            phone: data[6].value,
            paid: dropdownData.innerHTML === 'да'
        })
    })

    // если в ответе содержится ошибка, то выходим из функции и отображаем ее
    if (!response.ok) {
        const errorData = (await response.json()).message
        // если номер студенческого билета уже существует в базе
        if (errorData === 'This studentId already exists') {
            return 'StudentIdExists'
            // если комната, в которую хотят добавить студента переполнена
        } else if (errorData === 'The room is full') {
            return 'RoomIsFull'
            // если комната, в которую хотят добавить студента не существует
        } else if (errorData === 'The room does not exist') {
            return 'RoomDoesNotExist'
        }
    }

    // запрашиваем новый список студентов
    await getStudents(
        '/api/students',
        {
            keyword: searchString,
            filter: currentSubfilter,
            page: currentPage,
            showBy: itemsPerPage
        }
    )
    redrawTable(students)
    reassignButtons()

    // если все успешно, то блокируем возможность редактирования полей и
    // блокируем кнопку "Сохранить"
    editPopupObject.editPopup.classList.add('popup__edit__row__data--disabled')
    editPopupObject.editSaveButton.classList.add('popup__edit__buttons--disabled')
    editPopupObject.editButton.classList.remove('popup__edit__buttons--disabled')

    // если все успешно, то возвращаем true
    return true
}

// функция для закрытия или открытия модального окна справки
function toggleRulesPopup() {
    // если модальное окно не содержит класс, отвечающий за его открытие, то открываем модальное окно
    if (!rulesPopupObject.rulesPopupBackground.classList.contains('popup__background--active')) {
        rulesPopupObject.rulesPopup.style.display = 'block'

        // задержка для проигрывания анимации открытия модального окна
        setTimeout(() => {
            rulesPopupObject.rulesPopupBackground.classList.add('popup__background--active')
            rulesPopupObject.rulesPopupContent.classList.add('popup__content--active')
        }, 10)

    } else {
        rulesPopupObject.rulesPopupBackground.classList.remove('popup__background--active')
        rulesPopupObject.rulesPopupContent.classList.remove('popup__content--active')

        // задержка для проигрывания анимации закрытия модального окна
        setTimeout(() => {
            rulesPopupObject.rulesPopup.style.display = 'none'
        }, 300)
    }
}

// функция переключения режима отображения
function changeView(view) {
    // сохраняем в переменную текущий режим отображения
    currentView = view

    if (view === 'table') {
        viewSwitchObject.viewSwitchImages[0].classList.add('main__view-switch--disabled')
        viewSwitchObject.viewSwitchImages[1].classList.remove('main__view-switch--disabled')
    } else {
        viewSwitchObject.viewSwitchImages[1].classList.add('main__view-switch--disabled')
        viewSwitchObject.viewSwitchImages[0].classList.remove('main__view-switch--disabled')
    }
}

// функция для переключения цветовой темы
function changeLight(theme) {
    // переменная отвечающая за root селектор
    // в котором содержатся css переменные, управляющие цветовой темой
    const style = document.documentElement.style

    if (theme === 'dark') {
        // если тема темная, то меняем цвета для темной темы
        lightSwitchObject.lightSwitchImages[0].classList.add('main__light-switch--disabled')
        lightSwitchObject.lightSwitchImages[1].classList.remove('main__light-switch--disabled')
        style.setProperty('--BORDER_COLOR', '#ff6800')
        style.setProperty('--BACKGROUND_COLOR', '#272822')
        style.setProperty('--TEXT_COLOR', '#ffffff')
        style.setProperty('--HIGHLIGHT_COLOR', '#7b4700')
        style.setProperty('--SHADOW_COLOR', '#ff6600')
    } else {
        // если тема светлая, то меняем цвета для светлой темы
        lightSwitchObject.lightSwitchImages[1].classList.add('main__light-switch--disabled')
        lightSwitchObject.lightSwitchImages[0].classList.remove('main__light-switch--disabled')
        style.setProperty('--BORDER_COLOR', '#000000')
        style.setProperty('--BACKGROUND_COLOR', '#ffffff')
        style.setProperty('--TEXT_COLOR', '#000000')
        style.setProperty('--HIGHLIGHT_COLOR', '#f2b7b7')
        style.setProperty('--SHADOW_COLOR', '#00000066')
    }
}

// функция для получения списка студентов
async function getStudents(req, { keyword = '', filter = null, page = 0, showBy = 10 } = {}) {
    // создаем переменную для хранения query параметров
    const params = new URLSearchParams()

    // если в поисковую строку что-то введено, то добавляем это к параметрам
    if (keyword) params.append('keyword', keyword)
    // если подфильтр выбран, то добавляем его к параметрам
    if (filter) {
        if (filter.param === 'paid') {
            params.append(filter.param, filter.currentFilter === 'да')
        } else {
            params.append(filter.param, filter.currentFilter)
        }
    }

    // добавляем параметры для пагинации
    params.append('page', page)
    // добавляем параметры для количества студентов на странице
    params.append('size', showBy)

    // собираем url
    const url = params.toString().length > 0 ? `${req}?${params.toString()}` : req

    // отправляем запрос на получение списка студентов
    const response = await fetch(url, { method: "GET" });

    const data = await response.json()

    // если в ответе нет данных, то уменьшаем номер страницы
    // это необходимо для того, чтобы показать предыдущую страницу, если
    // удалить последнюю запись на странице
    if (data.content.length === 0 && data.totalPages !== 0) {
        // уменьшаем номер страницы
        currentPage -= 1
        // рекурсивно запрашиваем данные
        await getStudents(
            '/api/students',
            {
                keyword: searchString,
                filter: currentSubfilter,
                page: currentPage,
                showBy: itemsPerPage
            }
        )
    } else {
        // сохраняем информацию о студентах, текушей странице,
        // сколько всего страниц доступно в переменную
        students = data.content
        totalPages = data.totalPages
        currentPage = data.number
    }
}

// функция для отрисовки пагинации
function drawPagination(current, total) {
    // получаем массив с номерами страниц и троеточиями
    const paginationRange = getPaginationArray(current + 1, total)
    // обнуляем html код пагинации
    pagination.innerHTML = ''

    // добавляем кнопки пагинации в html
    paginationRange.forEach(e => {
        // если кнопка равна "...", то делаем ее ненажимаемой
        pagination.insertAdjacentHTML('beforeend', `
        <p ${+e === current + 1 ? 'class="pagination--active"' : e === '...' ? 'class="pagination--untouchable"' : ''}>${e}</p>
      `)
    })
}

// функция для получения массива номеров страниц с троеточиями
function getPaginationArray(current, total) {
    const delta = 1 // сколько страниц слева/справа от текущей
    const range = [] // массив с номерами страниц
    const rangeModified = [] // массив с номерами страниц и троеточиями

    // последний элемент
    let last;

    // проходим по максимальному числу страниц
    for (let i = 1; i <= total; i++) {
        // добавляем первую, последнюю страницу и все страницы,
        //  которые находятся в диапазоне delta от current
        if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
            range.push(i);
        }
    }

    // проходим по сформированному массиву с номерами страниц
    for (let i of range) {
        // пропускаем первую страницу, она отображается всегда
        if (last) {
            // если
            if (i - last === 2) {
                rangeModified.push(last + 1);
            } else if (i - last > 2) {
                rangeModified.push('...');
            }
        }

        // добавляем номер страницы
        rangeModified.push(i);
        last = i;
    }

    // возвращаем модифицированный список страниц
    return rangeModified
}

// функция для обновления отслеживания нажатий на кнопки
// удалить и редактировать у студентов
function reassignButtons() {
    // проходим по всем кнопкам удаления из таблицы студентов
    // и заново назаначаем им событие
    dataObject.dataButtonsRemove.forEach(e => {
        e.onclick = () => {
            toggleRemovePopup(e.dataset.studentId)
        }
    })

    // проходим по всем кнопкам редактирования карточки студентов
    // и заново назаначаем им событие
    dataObject.dataButtonsEdit.forEach(e => {
        e.onclick = async () => {
            await toggleEditPopup(e.dataset.studentId)
        }
    })
}

// функция для перерисовки таблицы или карточек студентов
function redrawTable(data) {
    // обнуляем html код в который будем вносить новые данные
    dataObject.dataComponent.innerHTML = ''
    dataObject.dataButtonsWrapper.innerHTML = ''
    dataObject.dataEmptyComponent.classList.remove('main__students__empty--active')


    // если текущим режимом отображением студентов выбран "таблица"
    if (currentView === 'table') {
        // отображаем заголовок таблицы
        dataObject.dataComponentHeader.classList.remove('main__students__row_header--disable')
        // отображаем оболочку с кнопками удаления и редактирования
        dataObject.dataButtonsWrapper.style.display = 'flex'
        // удаляем класс для карточек, если он есть
        dataObject.dataComponent.classList.remove('main__students__cards')

        // проходим по всем студентам
        for (let i = 0; i <= data.length - 1; i++) {
            // добавляем в html код каждого студента
            dataObject.dataComponent.insertAdjacentHTML('beforeend', `
                <div class="main__students__row${data[i].paid ? '' : ' main__students__row_unpaid'}" data-student-id=${data[i].id}>
                    <p>${data[i].lastName}</p>
                    <p>${data[i].firstName}</p>
                    <p>${data[i].patronymic}</p>
                    <p>${data[i].groupNum}</p>
                    <p>${data[i].room}</p>
                    <p>${data[i].studentCard}</p>
                    <p>${data[i].paid ? 'Да' : 'Нет'}</p>
                </div>
             `
            )

            // добавляем в html код кнопки удаления и редактирования
            dataObject.dataButtonsWrapper.insertAdjacentHTML('beforeend', `
            <div class="main__students__buttons__item">
                <div class="main__students__buttons__item_edit" data-student-id=${data[i].id}>
                    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg"><path d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1 0 32c0 8.8 7.2 16 16 16l32 0zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"></path></svg>
                </div>
                <div class="main__students__buttons__item_remove" data-student-id=${data[i].id}>
                    <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="100%" width="100%" xmlns="http://www.w3.org/2000/svg"><path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M376 144c-3.92 52.87-44 96-88 96s-84.15-43.12-88-96c-4-55 35-96 88-96s92 42 88 96z"></path><path fill="none" stroke-miterlimit="10" stroke-width="32" d="M288 304c-87 0-175.3 48-191.64 138.6-2 10.92 4.21 21.4 15.65 21.4H464c11.44 0 17.62-10.48 15.65-21.4C463.3 352 375 304 288 304z"></path><path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M144 232H32"></path></svg>
                </div>
            </div>
            `
            )
        }

        // сохраняем кнопки в переменные для дальнейшего использования
        dataObject.dataButtonsEdit = [...document.querySelectorAll('.main__students__buttons__item_edit')]
        dataObject.dataButtonsRemove = [...document.querySelectorAll('.main__students__buttons__item_remove')]
    } else {
        // если режим студенты должны отображаться карточками
        dataObject.dataComponentHeader.classList.add('main__students__row_header--disable')
        dataObject.dataButtonsWrapper.style.display = 'none'
        dataObject.dataComponent.classList.add('main__students__cards')

        // проходим по массиву students и добавляем в html код каждого студента в виде карточки
        for (let i = 0; i <= data.length - 1; i++) {
            dataObject.dataComponent.insertAdjacentHTML('beforeend', `
                <div class="main__students__cards__item" data-student-id=${data[i].id}>
                    <div class="main__students__cards__item__content ${data[i].paid ? '' : ' main__students__row_unpaid'}" data-student-id=${data[i].id}>
                        <p class="main__students__cards__item__title">${data[i].lastName}</p>
                        <div>
                            <p>${data[i].firstName}</p>
                            <p>${data[i].patronymic}</p>
                        </div>
                        <p class="main__students__cards__item__group">${data[i].groupNum}</p>
                    </div>
                    <div class="main__students__cards__remove" data-student-id=${data[i].id}>
                        <svg stroke="currentColor" fill="none" stroke-width="0" viewBox="0 0 15 15" height="100%" width="100%"
                            xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd"
                                d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z"
                                fill="currentColor"></path>
                        </svg>
                    </div>
                </div>
             `
            )
        }

        // сохраняем кнопки в переменные для дальнейшего использования
        dataObject.dataButtonsEdit = [...document.querySelectorAll('.main__students__cards__item__content')]
        dataObject.dataButtonsRemove = [...document.querySelectorAll('.main__students__cards__remove')]
    }


    // если ничего не найдено, то отображаем соответствующее сообщение
    if (data.length === 0) {
        tableEmpty()
    }

    // перерисовываем пагинацию
    drawPagination(currentPage, totalPages)
}

// функция для отображения сообщения о том, что ничего не было найдено
function tableEmpty() {
    dataObject.dataComponentHeader.classList.add('main__students__row_header--disable')
    dataObject.dataEmptyComponent.classList.add('main__students__empty--active')
}

function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}