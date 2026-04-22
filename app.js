const BASE_DATE = "2026-04-16";

const ROTATION = [
  ["烬区", "攀升", "断层"],
  ["临界点", "堑壕战", "金字塔"],
  ["烬区", "攀升", "风暴眼"],
  ["临界点", "堑壕战", "断轨"],
  ["烬区", "攀升", "余震"],
  ["临界点", "堑壕战", "乌莫斯运河"],
];

const weekdayLabels = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

const elements = {
  dateInput: document.querySelector("#dateInput"),
  todayBtn: document.querySelector("#todayBtn"),
  prevBtn: document.querySelector("#prevBtn"),
  nextBtn: document.querySelector("#nextBtn"),
  shareBtn: document.querySelector("#shareBtn"),
  resultDate: document.querySelector("#resultDate"),
  cycleBadge: document.querySelector("#cycleBadge"),
  resultHint: document.querySelector("#resultHint"),
  mapList: document.querySelector("#mapList"),
  forecastList: document.querySelector("#forecastList"),
  cycleTable: document.querySelector("#cycleTable"),
};

function parseDateString(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateLabel(date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  const weekday = weekdayLabels[date.getUTCDay()];
  return `${year}-${month}-${day} ${weekday}`;
}

function formatDateValue(date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, offset) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + offset);
  return result;
}

function getDaysBetween(target, base) {
  const diffMs = target.getTime() - base.getTime();
  return Math.floor(diffMs / 86400000);
}

function getRotationIndex(dateValue) {
  const targetDate = parseDateString(dateValue);
  const baseDate = parseDateString(BASE_DATE);
  const daysBetween = getDaysBetween(targetDate, baseDate);
  return ((daysBetween % ROTATION.length) + ROTATION.length) % ROTATION.length;
}

function getRotationForDate(dateValue) {
  const index = getRotationIndex(dateValue);
  return {
    index,
    dayNumber: index + 1,
    maps: ROTATION[index],
  };
}

function renderMapList(maps) {
  elements.mapList.innerHTML = maps
    .map(
      (mapName, index) => `
        <article class="map-chip">
          <strong>${mapName}</strong>
          <span>当日地图 ${index + 1}</span>
        </article>
      `
    )
    .join("");
}

function renderForecast(dateValue) {
  const startDate = parseDateString(dateValue);
  const items = Array.from({ length: ROTATION.length }, (_, offset) => {
    const currentDate = addDays(startDate, offset);
    const currentValue = formatDateValue(currentDate);
    const rotation = getRotationForDate(currentValue);
    return `
      <article class="forecast-item ${offset === 0 ? "is-selected" : ""}">
        <div class="forecast-title">
          <strong>${offset === 0 ? "当前查询日" : `+${offset} 天`}</strong>
          <span class="forecast-meta">第 ${rotation.dayNumber} 天</span>
        </div>
        <div class="forecast-meta">${formatDateLabel(currentDate)}</div>
        <div class="map-inline">${rotation.maps.join(" / ")}</div>
      </article>
    `;
  });

  elements.forecastList.innerHTML = items.join("");
}

function renderCycleTable(activeIndex) {
  elements.cycleTable.innerHTML = ROTATION.map((maps, index) => {
    const cycleDate = addDays(parseDateString(BASE_DATE), index);
    return `
      <article class="cycle-item ${index === activeIndex ? "is-active" : ""}">
        <div class="cycle-title">
          <strong>第 ${index + 1} 天</strong>
          <span class="cycle-meta">${formatDateLabel(cycleDate)}</span>
        </div>
        <div class="map-inline">${maps.join(" / ")}</div>
      </article>
    `;
  }).join("");
}

function updateQueryString(dateValue) {
  const url = new URL(window.location.href);
  url.searchParams.set("date", dateValue);
  window.history.replaceState({}, "", url);
}

function render(dateValue) {
  const rotation = getRotationForDate(dateValue);
  const currentDate = parseDateString(dateValue);

  elements.dateInput.value = dateValue;
  elements.resultDate.textContent = formatDateLabel(currentDate);
  elements.cycleBadge.textContent = `第 ${rotation.dayNumber} 天`;
  elements.resultHint.textContent = `当天会轮换到 ${rotation.maps.length} 张地图，这一天属于 6 天轮换中的第 ${rotation.dayNumber} 天。`;

  renderMapList(rotation.maps);
  renderForecast(dateValue);
  renderCycleTable(rotation.index);
  updateQueryString(dateValue);
}

function shiftDate(offset) {
  const currentDate = parseDateString(elements.dateInput.value);
  const nextDate = addDays(currentDate, offset);
  render(formatDateValue(nextDate));
}

function getInitialDateValue() {
  const fromQuery = new URLSearchParams(window.location.search).get("date");
  if (fromQuery && /^\d{4}-\d{2}-\d{2}$/.test(fromQuery)) {
    return fromQuery;
  }

  const now = new Date();
  return formatDateValue(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

elements.dateInput.addEventListener("change", (event) => {
  if (event.target.value) {
    render(event.target.value);
  }
});

elements.todayBtn.addEventListener("click", () => {
  const now = new Date();
  render(formatDateValue(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))));
});

elements.prevBtn.addEventListener("click", () => shiftDate(-1));
elements.nextBtn.addEventListener("click", () => shiftDate(1));

elements.shareBtn.addEventListener("click", async () => {
  const shareUrl = window.location.href;

  try {
    await navigator.clipboard.writeText(shareUrl);
    elements.shareBtn.textContent = "已复制";
    window.setTimeout(() => {
      elements.shareBtn.textContent = "复制查询链接";
    }, 1500);
  } catch (error) {
    window.prompt("复制下面的链接：", shareUrl);
  }
});

render(getInitialDateValue());
