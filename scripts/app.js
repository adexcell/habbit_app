'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitId;

/* page */

let page = {
  body: document.body,
  menu: document.querySelector('.menu__list'),
  menuAddBtn: document.querySelector('.menu__add'),
  header: {
    h1: document.querySelector('.header__h1'),
    progressPercent: document.querySelector('.progress__percent'),
    progressBar: document.querySelector('.progress__cover-bar')
  },
  content: {
    daysContainer: document.getElementById('days'),
    nextDay: document.querySelector('.habbit__day'),
  },
  cover: document.querySelector('.cover'),
  popup: {
    iconField: document.querySelector('.popup__form input[name="icon"]')
  }
}


/* utils */

function tooglePopup() {
  page.cover.classList.toggle('cover_hidden');
}

function loadData() {
  const habbitsString = localStorage.getItem(HABBIT_KEY);
  const habbitArray = JSON.parse(habbitsString);
  if (Array.isArray(habbitArray)) {
    habbits = habbitArray;
  }
  render();
}

function saveData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function resetForm(form, fields) {
  for (const field of fields) {
    form[field].value = '';
  }
}

function validateAndGetForm(form, fields) {
  const formData = new FormData(form);
  const res = {};
  for (const field of fields) {
    const fieldValue = formData.get(field);
    form[field].classList.remove('error');
    if (!fieldValue) {
      form[field].classList.add('error');
    }
    res[field] = fieldValue;
  }
  let isValid = true;
  for (const field of fields) {
    if (!res[field]) {
      isValid = false;
    }
  }
  if (!isValid) {
    return;
  }
  return res;
}

/* render */

function render() {
  page.body.innerHTML = '';
  page.body.innerHTML = `<div class="app">
    <div class="panel">
      <img class="logo" src="/images/logo.svg" alt="Логотип Habbit App">

      <nav class="menu">
        <div class="menu__list"></div>
        <button class="menu__add" onclick="tooglePopup()">
          <img src="./images/add_button.svg" alt="Добавить категорию">
        </button>
      </nav>

    </div>
    <div class="content">

      <header>
        <div class="header__h1">
          <h1 class="h1">Добавьте новую привычку</h1>
        </div>
        <div class="progress">
          <div class="progress__text">
            <div class="progress__name">Шкала прогресса</div>
            <div class="progress__percent"></div>
          </div>
          <div class="progress__bar">
            <div class="progress__cover-bar"></div>
          </div>
        </div>
      </header>

      <main>
        <div id="days"></div>
        <div class="habbit">
          <div class="habbit__day">День</div>
          <form class="habbit__form" onsubmit="addDays(event)">
            <img class="input__icon" src="./images/comment.svg" alt="Иконка комментария">
            <input name="comment" class="input_icon" type="text" placeholder="Комментарий">
            <button class="button" type="submit">Готово</button>
          </form>
        </div>
      </main>

    </div>

    <div class="cover cover_hidden">
      <div class="popup">
        <h2>Новая привычка</h2>
        <div class="icon-label">Иконка</div>

        <div class="icon-select">
          <button class="icon icon_active" onclick="setIcon(this, 'sport')">
            <img src="./images/sport.svg" alt="Спорт">
          </button>
          <button class="icon" onclick="setIcon(this, 'water')">
            <img src="./images/water.svg" alt="Напитки">
          </button>
          <button class="icon" onclick="setIcon(this, 'food')">
            <img src="./images/food.svg" alt="Еда">
          </button>
        </div>

        <form class="popup__form" onsubmit="addHabbit(event)">
          <input type="text" name="name" placeholder="Название" />
          <input type="text" name="icon" hidden placeholder="Иконка" value="sport" />
          <input type="number" name="target" placeholder="Цель" />
          <button class="button" type="submit">Добавить</button>
        </form>

        <button class="popup__close" onclick="tooglePopup()">
          <img src="./images/close.svg" alt="Закрыть попап">
        </button>

      </div>
    </div>
  </div>`

page = {
  body: document.body,
  menu: document.querySelector('.menu__list'),
  menuAddBtn: document.querySelector('.menu__add'),
  header: {
    h1: document.querySelector('.header__h1'),
    progressPercent: document.querySelector('.progress__percent'),
    progressBar: document.querySelector('.progress__cover-bar')
  },
  content: {
    daysContainer: document.getElementById('days'),
    nextDay: document.querySelector('.habbit__day'),
  },
  cover: document.querySelector('.cover'),
  popup: {
    iconField: document.querySelector('.popup__form input[name="icon"]')
  }
}
}

function rerenderMenu(activeHabbit) {
  page.menu.innerHTML = '';
  for (const habbit of habbits) {
    const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`)
    if (!existed) {
      // создание
      const element = document.createElement('button');
      element.setAttribute('menu-habbit-id', habbit.id);
      element.classList.add('menu__item');
      element.addEventListener('click', () => rerender(habbit.id));
      element.innerHTML = `<img src="./images/${habbit.icon}.svg" alt="${habbit.name}">`;
      if (activeHabbit.id === habbit.id) {
        element.classList.add('menu__item_active');
      }
      page.menu.appendChild(element);

      continue;
    }
    if (activeHabbit.id === habbit.id) {
      existed.classList.add('menu__item_active');
    } else {
      existed.classList.remove('menu__item_active');
    }
  }
}

function rerenderHead(activeHabbit) {
  page.header.h1.innerHTML = '';
  page.header.h1.innerHTML = `<h1 class="h1">${activeHabbit.name}</h1>
  <button class="habbit__delete" onclick="deleteHabbit(${activeHabbit.id})">
        <img src="./images/delete.svg" alt="Удалить привычку">
      </button>`
  const progress = activeHabbit.days.length / activeHabbit.target > 1
    ? 100
    : activeHabbit.days.length / activeHabbit.target * 100;
  page.header.progressPercent.innerText = `${progress.toFixed(0)}%`;
  page.header.progressBar.setAttribute('style', `width: ${progress}%`);
}

function rerenderContent(activeHabbit) {
  page.content.daysContainer.innerHTML = '';
  for (const index in activeHabbit.days) {
    const element = document.createElement('div');
    element.classList.add('habbit');
    element.innerHTML = `<div class="habbit__day">День ${Number(index) + 1}</div>
      <div class="habbit__comment">${activeHabbit.days[index].comment}</div>
      <button class="habbit__delete" onclick="deleteDay(${index})">
        <img src="./images/delete.svg" alt="Удалить день ${Number(index) + 1}">
      </button>`
    page.content.daysContainer.appendChild(element);
  }
  const nextDay = activeHabbit.days.length + 1;
  page.content.nextDay.innerText = `День ${nextDay}`;
}

function rerender(activeHabbitId) {
  const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);
  if (habbits.length === 0) {
    render()
  } else if (!activeHabbit) {
    return;
  }
  globalActiveHabbitId = activeHabbitId;
  document.location.replace(document.location.pathname + '#' + activeHabbitId)
  rerenderMenu(activeHabbit);
  rerenderHead(activeHabbit);
  rerenderContent(activeHabbit);
}

/* working with days */

function addDays(event) {
  event.preventDefault();
  const data = validateAndGetForm(event.target, ['comment']);
  if (!data) {
    return;
  }
  habbits = habbits.map(habbit => {
    if (habbit.id === globalActiveHabbitId) {
      return {
        ...habbit,
        days: habbit.days.concat([{ comment: data.comment }])
      }
    }
    return habbit;
  });
  resetForm(event.target, ['comment']);
  saveData();
  rerender(globalActiveHabbitId);
}

function deleteDay(habbitIndex) {
  habbits = habbits.map(habbit => {
    if (habbit.id === globalActiveHabbitId) {
      habbit.days.splice(habbitIndex, 1);
      return {
        ...habbit,
        days: habbit.days
      };
    }
    return habbit;
  })
  saveData();
  rerender(globalActiveHabbitId);
}

/* working with habbits */

function setIcon(context, icon) {
  page.popup.iconField.value = icon;
  const activeIcon = document.querySelector('.icon.icon_active');
  activeIcon.classList.remove('icon_active');
  context.classList.add('icon_active');
}

function addHabbit(event) {
  event.preventDefault();
  const data = validateAndGetForm(event.target, ['name', 'icon', 'target']);
  if (!data) {
    return;
  }
  let newId = 1;
  if (habbits.length > 0) {
    newId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0)
  }
  const newHabbit = {
    id: newId + 1,
    icon: data.icon,
    name: data.name,
    target: data.target,
    days: [],
  }
  habbits.push(newHabbit);
  resetForm(event.target, ['name', 'target']);
  saveData();
  rerender(newId + 1);
  tooglePopup();
}

function deleteHabbit(habbitId) {
  habbits = habbits.filter(habbit => !(habbit.id === habbitId));
  saveData();
  if (habbits.length > 0) {
  rerender(habbits[0].id);
  } else {
    render()
  }
}

/* init */

(() => {
  loadData();
  if (habbits.length === 0) {
    render();
  }
  const hashId = Number(document.location.hash.replace('#', ''));
  const urlHabbit = habbits.find(habbit => habbit.id == hashId);
  if (urlHabbit) {
    rerender(urlHabbit.id);
  } else {
    if (habbits.length > 0) {
      rerender(habbits[0].id);
    }
  }
 })()
