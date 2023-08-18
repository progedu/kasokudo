(function(){
const accelerationChartElement = document.getElementById('acceleration_chart');
const speedChartElement = document.getElementById('speed_chart');
const positionChartElement = document.getElementById('position_chart');
const dataMain = document.getElementById('data-main');
const intervalInput = document.getElementById('interval-input');

const url = new URL(window.location.href);
const params = url.searchParams;
const accelerationParam = params.get('accelerationList') || '-9.8,-9.8,-9.8,-9.8,-9.8,-9.8,-9.8,-9.8,-9.8,-9.8,-9.8';
let accelerationList = accelerationParam.split(',').map((x) => parseFloat(x));
const intervalParam = params.get('interval') || '1';
let interval = parseFloat(intervalParam);
history.replaceState('','','?accelerationList=' + accelerationList.join(',') + '&interval=' + interval)

let speedList = [];
let positionList = [];

const accelerationChart = new Chart(accelerationChartElement, {
    type: 'line',
    data: [],
    options: {}
});
const speedChart = new Chart(speedChartElement, {
    type: 'line',
    data: [],
    options: {}
});;
const positionChart = new Chart(positionChartElement, {
    type: 'line',
    data: [],
    options: {}
});;

let labels = [];
for (let i = 0; i < accelerationList.length; i++) {
    labels.push(new Decimal(i).mul(interval).toNumber()+ 's');
}

function drawAccelerationChart() {
    const data = {
        labels: labels,
        datasets: [{
            label: '加速度(m/s2)',
            data: accelerationList,
            borderColor: 'rgba(255, 100, 100, 1)'
        }]
    };

    const options = {
        animation: false,
    };

    accelerationChart.data = data;
    accelerationChart.options = options;
    accelerationChart.update();
}

function drawSpeedChart() {
    let speed = 0;
    let previousAcceleration = null;

    for (let i = 0; i < accelerationList.length; i++) {
        if (previousAcceleration !== null) {
            speed = (previousAcceleration + accelerationList[i]) * interval / 2 + speed;
        } else {
            speed = 0;
        }
        previousAcceleration = accelerationList[i];
        previousSpeed = speed;
        speedList[i] = speed;
    }
    
    const data = {
        labels: labels,
        datasets: [{
            label: '速度(m/s)',
            data: speedList,
            borderColor: 'rgba(100, 255, 100, 1)'
        }]
    };

    const options = {
        animation: false,
    };

    speedChart.data = data;
    speedChart.options = options;
    speedChart.update();
}

function drawPositionChart() {
    let position = 0;
    let previousSpeed = null;

    for (let i = 0; i < speedList.length; i++) {
        
        if (previousSpeed !== null) {
            position = (previousSpeed + speedList[i]) * interval / 2 + position;
        } else {
            position = 0;
        }
        previousSpeed = speedList[i];
        previousPosition = position;
        positionList[i] = position;
    }
    
    const data = {
        labels: labels,
        datasets: [{
            label: '高さ(m)',
            data: positionList,
            borderColor: 'rgba(100, 100, 255, 1)'
        }]
    };

    const options = {
        animation: false,
    };

    positionChart.data = data;
    positionChart.options = options;
    positionChart.update();
}

function syncData() {
    intervalInput.value = interval;
    dataMain.innerHTML = '';
    let time = 0;
    for(let i = 0; i < accelerationList.length; i++) {
        const html = `<div class='data-input p-2 rounded'>${time}s <input class="data-value" type='number' value='${accelerationList[i]}'>(m/s<sup>2</sup>)<span class="delete-button" data-index=${i}>✗</span></div>`
        dataMain.innerHTML += html;
        time = new Decimal(time).add(interval).toNumber()
    }
    const elements = document.getElementsByClassName('data-value');
    for (const element of elements) {
        element.addEventListener('change', () => {
            changeData();
        });
    }
    const deleteButtonElements = document.getElementsByClassName('delete-button');
    for (const element of deleteButtonElements) {
        element.addEventListener('click', () => {
            const index = parseInt(element.getAttribute('data-index'));
            console.log(index);
            accelerationList.splice(index, 1)
            syncData();
            changeData();
        });
    }
}

document.getElementById('add-data-button').addEventListener('click', () => {
    accelerationList.push(0);
    syncData();
    changeData();
})

function changeData() {
    accelerationList = []
    const elements = document.getElementsByClassName('data-value');
    for (const element of elements) {
        accelerationList.push(parseFloat(element.value));
    }
    history.replaceState('','','?accelerationList=' + accelerationList.join(',') + '&interval=' + interval)
    labels = [];
    for (let i = 0; i < accelerationList.length; i++) {
        labels.push(new Decimal(i).mul(interval).toNumber()+ 's');
    }
    syncGraph();
}

intervalInput.addEventListener('change', () => {
    interval = intervalInput.value;
    syncData();
    changeData();
});

function syncGraph() {
    drawAccelerationChart();
    drawSpeedChart();
    drawPositionChart();
}

syncGraph();
syncData();
}());