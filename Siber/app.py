from flask import Flask, request, render_template, redirect, url_for, flash
from werkzeug.utils import secure_filename
import os
import logging
from logging import Handler, StreamHandler
from datetime import datetime, timedelta
from collections import Counter
import threading
import time
import requests


class PrependFileHandler(Handler):
    def __init__(self, filename):
        Handler.__init__(self)
        self.filename = filename

    def emit(self, record):
        log_entry = self.format(record)
        with open(self.filename, 'r+') as file:
            content = file.read()
            file.seek(0, 0)
            file.write(log_entry + '\n' + content)


app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/'
app.config['ALLOWED_EXTENSIONS'] = {'csv', 'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'apk', 'json',
                                    'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'mp3', 'mp4', 'mkv'}
app.config['MAX_FILES'] = 15
app.config['SECRET_KEY'] = 'supersecretkey'
app.config['THRESHOLD'] = 3
app.config['CHECK_INTERVAL'] = 180  # Default to 3 minutes

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Configure logging
file_handler = PrependFileHandler('logs.txt')
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))

console_handler = StreamHandler()
console_handler.setLevel(logging.DEBUG)
console_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))

logging.basicConfig(level=logging.DEBUG, handlers=[file_handler, console_handler])

# Clear file_data.log on server start
with open('file_data.log', 'w') as file:
    file.truncate(0)

logging.info('Application has started.')


def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


def load_file_data():
    """ Load file data from the logs """
    if os.path.exists('file_data.log'):
        with open('file_data.log', 'r') as file:
            data = file.readlines()
        return [eval(line.strip()) for line in data]
    return []


def save_file_data(file_data):
    """ Save file data to the logs """
    with open('file_data.log', 'a') as file:
        file.write(f"{file_data}\n")


def update_notifications():
    files = load_file_data()
    file_counts = Counter(file['file_type'] for file in files)

    notifications = []
    for ext in app.config['ALLOWED_EXTENSIONS']:
        if file_counts[ext] >= app.config['THRESHOLD']:
            notifications.append(f"Threshold met for {ext.upper()}.")
        else:
            notifications.append(f"No threshold met for {ext.upper()}.")

    with open('notifications.log', 'w') as file:
        for notification in notifications:
            file.write(f"{notification}\n")


def reset_uploads_folder():
    for file in os.listdir(app.config['UPLOAD_FOLDER']):
        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], file))


def check_threshold():
    """ Periodically update notifications and reset uploads """
    while True:
        time.sleep(app.config['CHECK_INTERVAL'])
        update_notifications()
        reset_uploads_folder()  # Reset uploads folder every interval
        with open('file_data.log', 'w') as file:
            file.truncate(0)  # Clear the file_data.log


def fetch_and_save_file(url_or_ip):
    """ Fetch file from URL or IP and save it """
    try:
        response = requests.get(url_or_ip, stream=True)
        if response.status_code == 200:
            # Extract filename from URL or response headers
            filename = url_or_ip.split("/")[-1]
            if 'content-disposition' in response.headers:
                cd = response.headers.get('content-disposition')
                if 'filename=' in cd:
                    filename = cd.split('filename=')[1].strip('"')

            if allowed_file(filename):
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(filename))
                with open(filepath, 'wb') as file:
                    for chunk in response.iter_content(chunk_size=8192):
                        file.write(chunk)

                upload_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                file_data = {
                    'filename': filename,
                    'file_type': filename.rsplit('.', 1)[1].lower(),
                    'upload_time': upload_time.split()[1],
                    'upload_date': upload_time.split()[0]
                }
                save_file_data(file_data)
                logging.info(f"File fetched and saved: {filepath}")
                return True, f"File '{filename}' fetched and uploaded successfully."
            else:
                logging.warning(f"File type not allowed: {filename}")
                return False, f"File type not allowed: {filename}"
        else:
            logging.warning(f"Failed to fetch file from URL/IP: {url_or_ip}")
            return False, f"Failed to fetch file from URL/IP: {url_or_ip}."
    except Exception as e:
        logging.error(f"Error fetching file: {str(e)}")
        return False, f"Error fetching file: {str(e)}"


@app.route('/', methods=['GET', 'POST'])
def upload_file():
    logging.debug('Handling request to upload file')
    if request.method == 'POST':
        logging.debug('POST request received')
        files = load_file_data()
        file_counts = Counter(file['file_type'] for file in files)

        if 'file' in request.files:
            uploaded_files = request.files.getlist('file')
            logging.debug(f'Received files: {[file.filename for file in uploaded_files]}')

            for file in uploaded_files:
                if file and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    file_extension = filename.rsplit('.', 1)[1].lower()

                    # Log the event if the threshold for this file type is met
                    if file_counts[file_extension] >= app.config['THRESHOLD']:
                        flash(f"Threshold is already met for {file_extension.upper()} File")
                        logging.info(f"Threshold met for {file_extension.upper()} file: {filename}")

                    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    file.save(filepath)
                    logging.info(f"File saved: {filepath}")

                    # Record file data
                    upload_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    file_data = {
                        'filename': filename,
                        'file_type': file_extension,
                        'upload_time': upload_time.split()[1],
                        'upload_date': upload_time.split()[0]
                    }
                    save_file_data(file_data)
                    logging.debug(f"File data saved: {file_data}")

                    file_counts[file_extension] += 1

            # Update notifications immediately after uploading files
            update_notifications()
            return redirect(url_for('upload_file'))

    files = load_file_data()

    # Handle search
    query = request.args.get('query', '')
    filter_by = request.args.get('filter_by', 'filename')
    time_interval = request.args.get('time_interval', '')
    search_date = request.args.get('search_date', '')

    if query:
        files = [file for file in files if query.lower() in file[filter_by].lower()]

    if time_interval:
        now = datetime.now()
        if time_interval == '10m':
            start_time = now - timedelta(minutes=10)
        elif time_interval == '30m':
            start_time = now - timedelta(minutes=30)
        else:
            start_time = now

        files = [file for file in files if
                 datetime.strptime(file['upload_date'] + ' ' + file['upload_time'], '%Y-%m-%d %H:%M:%S') >= start_time]

    if search_date:
        files = [file for file in files if file['upload_date'] == search_date]

    # Calculate file type counts
    file_counts = Counter(file['file_type'] for file in files)
    notifications = []
    for ext in app.config['ALLOWED_EXTENSIONS']:
        if file_counts[ext] >= app.config['THRESHOLD']:
            notifications.append(f"Threshold met for {ext.upper()}.")
        else:
            notifications.append(f"No threshold met for {ext.upper()}.")

    # Calculate the most common file types for the selected date
    most_common_file_types = None
    if search_date:
        date_file_counts = Counter(file['file_type'] for file in files if file['upload_date'] == search_date)
        most_common_file_types = date_file_counts.most_common()

    return render_template('upload.html', files=files, count=len(files), query=query, filter_by=filter_by,
                           time_interval=time_interval, notifications=notifications, search_date=search_date,
                           most_common_file_types=most_common_file_types)


@app.route('/logs')
def view_logs():
    logging.debug('Viewing logs')
    if os.path.exists('logs.txt'):
        with open('logs.txt', 'r') as file:
            logs = file.readlines()
    else:
        logs = ["No logs available."]
    return render_template('logs.html', logs=logs)


@app.route('/notifications')
def view_notifications():
    logging.debug('Viewing notifications')
    if os.path.exists('notifications.log'):
        with open('notifications.log', 'r') as file:
            notifications = file.readlines()
    else:
        notifications = ["No notifications available."]
    return render_template('notifications.html', notifications=notifications)


@app.route('/records')
def view_records():
    logging.debug('Viewing records')
    files = load_file_data()
    file_counts = {ext: 0 for ext in app.config['ALLOWED_EXTENSIONS']}
    for file in files:
        file_counts[file['file_type']] += 1
    current_year = datetime.now().year

    search_date = request.args.get('search_date', '')
    search_time = request.args.get('search_time', '')

    most_common_file_types = []

    if search_date:
        files = [file for file in files if file['upload_date'] == search_date]
        date_file_counts = Counter(file['file_type'] for file in files)
        most_common_file_types = date_file_counts.most_common()

    return render_template('records.html', file_counts=file_counts, current_year=current_year,
                           search_date=search_date, most_common_file_types=most_common_file_types)



@app.route('/fetch_file', methods=['POST'])
def fetch_file():
    url_or_ip = request.form.get('url_or_ip')
    logging.debug(f"Fetching file from: {url_or_ip}")
    success, message = fetch_and_save_file(url_or_ip)
    flash(message)
    return redirect(url_for('upload_file'))


if __name__ == '__main__':
    threading.Thread(target=check_threshold, daemon=True).start()
    app.run(debug=True, host = '0.0.0.0', port=5000)