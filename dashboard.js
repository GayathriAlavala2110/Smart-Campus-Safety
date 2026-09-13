// =====================================================
// SMART CAMPUS SAFETY - COMPLETE DASHBOARD JAVASCRIPT
// =====================================================

let alertHistory = [];
let lastRisk = null;


// =====================================================
// START DASHBOARD
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Smart Campus Safety dashboard started.");

    startLocationDetection();

});


// =====================================================
// LOCATION DETECTION
// =====================================================

function startLocationDetection() {

    const locationStatus =
        document.getElementById("locationStatus");

    if (!navigator.geolocation) {

        locationStatus.textContent =
            "⚠️ Location is not supported. Loading demo data...";

        loadDemoData();

        return;
    }

    locationStatus.textContent =
        "📍 Requesting presentation location...";

    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;

            console.log("Presentation location detected.");

            loadLiveData(latitude, longitude);

            // Update every 5 minutes
            setInterval(function () {

                loadLiveData(latitude, longitude);

            }, 300000);

        },

        function (error) {

            console.log(
                "Location unavailable:",
                error.message
            );

            locationStatus.textContent =
                "⚠️ Location unavailable. Loading demo sensor data...";

            loadDemoData();

        },

        {
            enableHighAccuracy: false,
            timeout: 15000,
            maximumAge: 300000
        }

    );
}


// =====================================================
// LIVE DATA FROM OPEN-METEO
// =====================================================

async function loadLiveData(latitude, longitude) {

    try {

        document.getElementById("locationStatus").textContent =
            "📍 Updating live environmental data...";


        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m`;


        const airURL =
            `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm2_5,pm10`;


        const weatherResponse =
            await fetch(weatherURL);


        const airResponse =
            await fetch(airURL);


        if (!weatherResponse.ok ||
            !airResponse.ok) {

            throw new Error(
                "Live environmental API failed."
            );

        }


        const weather =
            await weatherResponse.json();


        const air =
            await airResponse.json();


        const temperature =
            weather.current.temperature_2m;


        const humidity =
            weather.current.relative_humidity_2m;


        const pm25 =
            air.current.pm2_5;


        const pm10 =
            air.current.pm10;


        updateDashboard(
            temperature,
            humidity,
            pm25,
            pm10,
            true
        );


        console.log(
            "Live environmental data:",
            temperature,
            humidity,
            pm25,
            pm10
        );

    }

    catch (error) {

        console.error(
            "Live data error:",
            error
        );


        document.getElementById("locationStatus").textContent =
            "⚠️ Live data unavailable. Loading demo data...";


        loadDemoData();

    }

}


// =====================================================
// DEMO DATA FALLBACK
// =====================================================

function loadDemoData() {

    const temperature = 32;
    const humidity = 65;
    const pm25 = 28;
    const pm10 = 45;

    updateDashboard(
        temperature,
        humidity,
        pm25,
        pm10,
        false
    );

}


// =====================================================
// UPDATE COMPLETE DASHBOARD
// =====================================================

function updateDashboard(
    temperature,
    humidity,
    pm25,
    pm10,
    isLive
) {


    // -------------------------------------------------
    // SENSOR VALUES
    // -------------------------------------------------

    const temperatureElement =
        document.getElementById("temperatureValue");

    const humidityElement =
        document.getElementById("humidityValue");

    const airElement =
        document.getElementById("airQualityValue");

    const fireElement =
        document.getElementById("smokeValue");


    if (temperatureElement) {

        temperatureElement.textContent =
            temperature + "°C";

    }


    if (humidityElement) {

        humidityElement.textContent =
            humidity + "%";

    }


    if (airElement) {

        airElement.textContent =
            pm25 + " µg/m³";

    }


    // -------------------------------------------------
    // FIRE RISK
    // -------------------------------------------------

    const fireRisk =
        calculateFireRisk(
            temperature,
            humidity,
            pm25
        );


    if (fireElement) {

        fireElement.textContent =
            fireRisk;

    }


    // -------------------------------------------------
    // RISK LEVEL
    // -------------------------------------------------

    let risk =
        "🟢 NORMAL";

    let message =
        "Campus conditions are currently normal.";

    let reason =
        "No safety risks detected.";


    if (
        temperature >= 40 ||
        humidity >= 85 ||
        pm25 >= 55 ||
        fireRisk >= 70
    ) {

        risk =
            "🔴 HIGH";

        message =
            "Immediate attention required.";

        reason =
            "Critical environmental or fire-risk conditions detected.";

    }

    else if (
        temperature >= 35 ||
        humidity >= 75 ||
        pm25 >= 35 ||
        fireRisk >= 40
    ) {

        risk =
            "🟠 MEDIUM";

        message =
            "Monitoring required.";

        reason =
            "One or more environmental conditions require monitoring.";

    }


    // -------------------------------------------------
    // RISK DISPLAY
    // -------------------------------------------------

    const riskElement =
        document.getElementById("riskValue");


    if (riskElement) {

        riskElement.textContent =
            risk;


        riskElement.classList.remove(
            "risk-normal",
            "risk-medium",
            "risk-high",
            "normal"
        );


        if (risk.includes("HIGH")) {

            riskElement.classList.add(
                "risk-high"
            );

        }

        else if (risk.includes("MEDIUM")) {

            riskElement.classList.add(
                "risk-medium"
            );

        }

        else {

            riskElement.classList.add(
                "risk-normal"
            );

        }

    }


    const riskMessage =
        document.getElementById("riskMessage");


    if (riskMessage) {

        riskMessage.textContent =
            message;

    }


    const riskReason =
        document.getElementById("riskReason");


    if (riskReason) {

        riskReason.textContent =
            "Reason: " + reason;

    }


    // -------------------------------------------------
    // ALERT HISTORY
    // -------------------------------------------------

    if (
        lastRisk !== risk
    ) {

        recordSafetyAlert(
            risk,
            reason
        );

    }


    lastRisk =
        risk;


    // -------------------------------------------------
    // EMERGENCY ALERT
    // -------------------------------------------------

    const emergencyAlert =
        document.getElementById(
            "emergencyAlert"
        );


    const emergencyMessage =
        document.getElementById(
            "emergencyMessage"
        );


    if (
        temperature >= 40 ||
        humidity >= 85 ||
        pm25 >= 55 ||
        fireRisk >= 70
    ) {

        if (emergencyAlert) {

            emergencyAlert.style.display =
                "block";

        }


        if (emergencyMessage) {

            emergencyMessage.textContent =
                "🚨 Critical environmental/fire-risk condition detected.";

        }

    }

    else {

        if (emergencyAlert) {

            emergencyAlert.style.display =
                "none";

        }

    }


    // -------------------------------------------------
    // LOCATION STATUS
    // -------------------------------------------------

    const locationStatus =
        document.getElementById(
            "locationStatus"
        );


    if (locationStatus) {

        if (isLive) {

            locationStatus.textContent =
                "📍 Live environmental data for the current presentation location";

        }

        else {

            locationStatus.textContent =
                "📊 Demo environmental data — live location unavailable";

        }

    }


    // -------------------------------------------------
    // CAMPUS ZONES
    // -------------------------------------------------

    updateZoneStatus(
        temperature,
        humidity,
        pm25,
        fireRisk
    );


    // -------------------------------------------------
    // EMERGENCY RESPONSE
    // -------------------------------------------------

    updateEmergencyResponse(
        risk,
        temperature,
        humidity,
        pm25,
        fireRisk
    );


    // -------------------------------------------------
    // REPORT
    // -------------------------------------------------

    const reportTime =
        document.getElementById(
            "reportTime"
        );


    if (reportTime) {

        reportTime.textContent =
            new Date().toLocaleString();

    }


    setText(
        "reportTemperature",
        temperature + "°C"
    );


    setText(
        "reportHumidity",
        humidity + "%"
    );


    setText(
        "reportAirQuality",
        pm25 + " µg/m³"
    );


    setText(
        "reportFireRisk",
        fireRisk
    );


    setText(
        "reportRisk",
        risk
    );


    // -------------------------------------------------
    // MANAGEMENT
    // -------------------------------------------------

    setText(
        "managementRisk",
        risk
    );


    const managementRisk =
        document.getElementById(
            "managementRisk"
        );


    if (managementRisk) {

        managementRisk.classList.remove(
            "risk-normal",
            "risk-medium",
            "risk-high"
        );


        if (risk.includes("HIGH")) {

            managementRisk.classList.add(
                "risk-high"
            );

        }

        else if (risk.includes("MEDIUM")) {

            managementRisk.classList.add(
                "risk-medium"
            );

        }

        else {

            managementRisk.classList.add(
                "risk-normal"
            );

        }

    }


    setText(
        "totalAlerts",
        alertHistory.length
    );


    let managementResponse =
        "READY";


    if (risk.includes("HIGH")) {

        managementResponse =
            "EMERGENCY";

    }

    else if (risk.includes("MEDIUM")) {

        managementResponse =
            "MONITORING";

    }


    setText(
        "managementResponse",
        managementResponse
    );


    setText(
        "systemStatus",
        "ONLINE"
    );


    setText(
        "managementUpdated",
        new Date().toLocaleString()
    );


    console.log(
        "Dashboard updated successfully."
    );

}


// =====================================================
// HELPER FUNCTION
// =====================================================

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}


// =====================================================
// FIRE RISK CALCULATION
// =====================================================

function calculateFireRisk(
    temperature,
    humidity,
    airQuality
) {

    let risk = 10;


    if (temperature >= 35) {

        risk += 25;

    }


    if (temperature >= 40) {

        risk += 20;

    }


    if (humidity <= 40) {

        risk += 20;

    }


    if (humidity <= 30) {

        risk += 15;

    }


    if (airQuality >= 35) {

        risk += 10;

    }


    if (airQuality >= 55) {

        risk += 15;

    }


    return Math.min(
        100,
        risk
    );

}


// =====================================================
// CAMPUS ZONES
// =====================================================

function updateZoneStatus(
    temperature,
    humidity,
    airQuality,
    fireRisk
) {

    const zones = [
        "mainBlockStatus",
        "eceLabStatus",
        "libraryStatus",
        "groundStatus"
    ];


    let status =
        "🟢 SAFE";


    let className =
        "zone-status safe";


    if (
        temperature >= 40 ||
        humidity >= 85 ||
        airQuality >= 55 ||
        fireRisk >= 70
    ) {

        status =
            "🔴 DANGER";

        className =
            "zone-status danger";

    }

    else if (
        temperature >= 35 ||
        humidity >= 75 ||
        airQuality >= 35 ||
        fireRisk >= 40
    ) {

        status =
            "🟠 WARNING";

        className =
            "zone-status warning";

    }


    zones.forEach(
        function (zoneId) {

            const element =
                document.getElementById(
                    zoneId
                );


            if (element) {

                element.textContent =
                    status;

                element.className =
                    className;

            }

        }
    );

}


// =====================================================
// EMERGENCY RESPONSE
// =====================================================

function updateEmergencyResponse(
    risk,
    temperature,
    humidity,
    airQuality,
    fireRisk
) {

    const responseStatus =
        document.getElementById(
            "responseStatus"
        );


    const responseRisk =
        document.getElementById(
            "responseRisk"
        );


    const responseAction =
        document.getElementById(
            "responseAction"
        );


    if (responseRisk) {

        responseRisk.textContent =
            risk;

    }


    if (risk.includes("HIGH")) {

        if (responseStatus) {

            responseStatus.textContent =
                "🔴 Emergency response required";

        }


        if (responseAction) {

            responseAction.textContent =
                "Move people away from the affected area and contact campus emergency/security personnel.";

        }

    }

    else if (risk.includes("MEDIUM")) {

        if (responseStatus) {

            responseStatus.textContent =
                "🟠 Monitoring response required";

        }


        if (responseAction) {

            responseAction.textContent =
                "Continue monitoring the affected conditions and be prepared to take safety action.";

        }

    }

    else {

        if (responseStatus) {

            responseStatus.textContent =
                "🟢 No emergency response required";

        }


        if (responseAction) {

            responseAction.textContent =
                "Continue normal campus monitoring.";

        }

    }

}


// =====================================================
// ACKNOWLEDGE ALERT
// =====================================================

function acknowledgeAlert() {

    const responseStatus =
        document.getElementById(
            "responseStatus"
        );


    if (responseStatus) {

        responseStatus.textContent =
            "✅ Alert acknowledged by management";

    }

}


// =====================================================
// START RESPONSE
// =====================================================

function startResponse() {

    const responseStatus =
        document.getElementById(
            "responseStatus"
        );


    if (responseStatus) {

        responseStatus.textContent =
            "🚑 Emergency response started";

    }

}


// =====================================================
// AI SAFETY ASSISTANT
// =====================================================

function askAssistant() {

    const input =
        document.getElementById(
            "assistantQuestion"
        );


    const answer =
        document.getElementById(
            "assistantAnswer"
        );


    if (!input || !answer) {

        return;

    }


    const question =
        input.value
        .toLowerCase()
        .trim();


    if (question === "") {

        answer.textContent =
            "Please enter a safety question.";

        return;

    }


    if (
        question.includes("high risk") ||
        question.includes("danger")
    ) {

        answer.textContent =
            "🔴 High risk detected. Move people away from the affected area and contact campus emergency or security personnel.";

    }

    else if (
        question.includes("medium risk") ||
        question.includes("warning")
    ) {

        answer.textContent =
            "🟠 A medium-risk condition requires monitoring. Continue observing the affected conditions and be prepared to take safety action.";

    }

    else if (
        question.includes("fire") ||
        question.includes("smoke")
    ) {

        answer.textContent =
            "🔥 If a fire-related risk is detected, keep people away from the affected area and contact campus emergency or security personnel.";

    }

    else if (
        question.includes("air quality") ||
        question.includes("pollution")
    ) {

        answer.textContent =
            "🌫️ Air quality is monitored using live environmental data. Higher pollution levels can increase the campus risk level.";

    }

    else if (
        question.includes("temperature") ||
        question.includes("weather")
    ) {

        answer.textContent =
            "🌡️ Temperature is obtained from live environmental data for the current presentation location.";

    }

    else if (
        question.includes("safe") ||
        question.includes("normal")
    ) {

        answer.textContent =
            "🟢 When the system shows NORMAL, no current safety risk has been detected by the monitored indicators.";

    }

    else {

        answer.textContent =
            "🤖 I can help with campus risk levels, fire safety, air quality, temperature, emergency response, and safety monitoring.";

    }


    input.value = "";

}


// =====================================================
// ALERT HISTORY
// =====================================================

function recordSafetyAlert(
    risk,
    reason
) {

    if (
        risk.includes("NORMAL")
    ) {

        return;

    }


    const alert = {

        time:
            new Date().toLocaleString(),

        risk:
            risk,

        reason:
            reason

    };


    alertHistory.unshift(
        alert
    );


    if (
        alertHistory.length > 10
    ) {

        alertHistory.pop();

    }


    displayAlertHistory();

}


// =====================================================
// DISPLAY ALERT HISTORY
// =====================================================

function displayAlertHistory() {

    const history =
        document.getElementById(
            "alertHistory"
        );


    if (!history) {

        return;

    }


    if (
        alertHistory.length === 0
    ) {

        history.innerHTML =
            "<p>🟢 No safety alerts recorded yet.</p>";

        return;

    }


    history.innerHTML = "";


    alertHistory.forEach(
        function (alert) {

            const alertItem =
                document.createElement(
                    "div"
                );


            alertItem.className =
                "alert-item";


            alertItem.innerHTML = `
                <p><strong>${alert.risk}</strong></p>
                <p>🕒 ${alert.time}</p>
                <p>⚠️ ${alert.reason}</p>
                <hr>
            `;


            history.appendChild(
                alertItem
            );

        }
    );

}