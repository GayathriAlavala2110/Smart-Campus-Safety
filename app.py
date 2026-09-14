from flask import Flask, render_template, jsonify, send_from_directory
import json
import os

# Allow dashboard.html to be in the GitHub root
app = Flask(
    __name__,
    template_folder=".",
    static_folder=None
)


# =========================
# HOME / DASHBOARD
# =========================
@app.route("/")
def home():
    return render_template("dashboard.html")


# =========================
# STATIC FILES
# Works with both:
# /css/style.css
# /static/css/style.css
# /js/dashboard.js
# /images/...
# /videos/...
# =========================
@app.route("/static/<path:filename>")
def static_files(filename):
    # First try normal folder structure
    normal_path = os.path.join("static", filename)

    if os.path.isfile(normal_path):
        directory = os.path.dirname(normal_path)
        file_name = os.path.basename(normal_path)

        if directory == "":
            directory = "."

        return send_from_directory(directory, file_name)

    # Then try files uploaded directly to root folders
    root_path = filename

    if os.path.isfile(root_path):
        directory = os.path.dirname(root_path)

        if directory == "":
            directory = "."

        file_name = os.path.basename(root_path)

        return send_from_directory(directory, file_name)

    # Try removing "static/" if present
    if filename.startswith("static/"):
        root_path = filename[7:]

        if os.path.isfile(root_path):
            directory = os.path.dirname(root_path)

            if directory == "":
                directory = "."

            file_name = os.path.basename(root_path)

            return send_from_directory(directory, file_name)

    return "File not found", 404


# =========================
# ALSO SERVE CSS / JS /
# IMAGES / VIDEOS DIRECTLY
# =========================
@app.route("/css/<path:filename>")
def css_files(filename):
    return send_from_directory("css", filename)


@app.route("/js/<path:filename>")
def js_files(filename):
    return send_from_directory("js", filename)


@app.route("/images/<path:filename>")
def image_files(filename):
    return send_from_directory("images", filename)


@app.route("/videos/<path:filename>")
def video_files(filename):
    return send_from_directory("videos", filename)


# =========================
# SENSOR DATA
# =========================
@app.route("/api/sensor-data")
def sensor_data():

    possible_files = [
        "data/sensor_data.json",
        "sensor_data.json",
        "sensor.data.json"
    ]

    data_file = None

    for file_path in possible_files:
        if os.path.exists(file_path):
            data_file = file_path
            break

    # If JSON file is missing, use safe default values
    if data_file is None:
        data = {
            "temperature": 32,
            "humidity": 65,
            "air_quality": 28,
            "smoke_level": 10,
            "location": "Current Campus",
            "status": "normal"
        }
    else:
        try:
            with open(data_file, "r", encoding="utf-8") as file:
                data = json.load(file)
        except Exception:
            data = {
                "temperature": 32,
                "humidity": 65,
                "air_quality": 28,
                "smoke_level": 10,
                "location": "Current Campus",
                "status": "normal"
            }

    temperature = float(data.get("temperature", 32))
    humidity = float(data.get("humidity", 65))
    air_quality = float(data.get("air_quality", 28))
    smoke_level = float(data.get("smoke_level", 10))

    warnings = []

    if temperature >= 40:
        warnings.append("High temperature detected")

    if humidity >= 85:
        warnings.append("High humidity detected")

    if air_quality >= 55:
        warnings.append("Poor air quality detected")

    if smoke_level >= 50:
        warnings.append("High smoke level detected")

    # =========================
    # RISK DETECTION
    # =========================
    if warnings:
        risk = "🔴 HIGH"
        message = "Immediate attention required."
        reason = ", ".join(warnings)

    elif (
        temperature >= 35
        or humidity >= 75
        or air_quality >= 35
        or smoke_level >= 25
    ):
        risk = "🟠 MEDIUM"
        message = "Monitoring required."
        reason = "One or more environmental values require monitoring."

    else:
        risk = "🟢 NORMAL"
        message = "Campus conditions are currently normal."
        reason = "No safety risks detected."

    data["temperature"] = temperature
    data["humidity"] = humidity
    data["air_quality"] = air_quality
    data["smoke_level"] = smoke_level

    data["risk"] = risk
    data["message"] = message
    data["reason"] = reason

    return jsonify(data)


# =========================
# HEALTH CHECK
# =========================
@app.route("/health")
def health():
    return jsonify({
        "status": "running",
        "project": "AI-Enabled Smart Campus Safety & Emergency Response System Using IoT"
    })


# =========================
# START SERVER
# =========================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))

    app.run(
        host="0.0.0.0",
        port=port
    )
