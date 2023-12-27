const routeLogin = "/login.html";
if (!localStorage.getItem("isLogin")) {
    window.location.href = routeLogin;
}

var keyUser = localStorage.getItem("isLogin");

const firebaseConfig = {
    apiKey: "AIzaSyBckkNHIvMoIgxIHt_3HOTlMcso2V2uN_Q",
    authDomain: "database-app-android-4c845.firebaseapp.com",
    databaseURL: "https://database-app-android-4c845-default-rtdb.firebaseio.com",
    projectId: "database-app-android-4c845",
    storageBucket: "database-app-android-4c845.appspot.com",
    messagingSenderId: "596263588445",
    appId: "1:596263588445:web:ef8e05eee6120f71eeb3b4"
};
// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);

// Lấy reference đến Firebase Realtime Database
var database = firebase.database();


database.ref(keyUser).on('value', function (snapshot) {
    var data = snapshot.val();

    console.log('data', data);
    applyButtonStates(data);
});
let audioAlert = {};
let audioSOS  = {};

$(document).ready(function () {
    // Hiển thị loading khi trang được tải
    var containerLoading = $('.container-loading');
    var containerContent = $('.container-content');
    setTimeout(() => {
        containerLoading.hide();
        containerContent.show();
    }, 1000);
});
function toggleButton(button) {
    // Kiểm tra xem button có lớp bật hay không không
    var isOn = button.classList.contains('turn-on');
    var id = $('#' + button.id);
    var message = "Hệ thống đang bảo trì, vui lòng thử lại sau!";

    // bật 
    if (!isOn) {
        button.classList.add('turn-on');
        id.attr("value", true);
        message = "Bật cảnh báo " + id.attr("text-title") + " thành công";
        playAudio(audioSOS, './mp3/sos.mp3');
    } else {
        button.classList.remove('turn-on');
        id.attr("value", false);
        message = "Tắt cảnh báo " + id.attr("text-title") + " thành công";
        stopAudio(audioSOS);
    }
    getAllValuesAndCallApi(message);
}
function applyButtonStates(data) {
    // Duyệt qua các key trong data và áp dụng trạng thái lên các button
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            var buttonId = '#' + key;
            var button = $(buttonId);

            // Kiểm tra giá trị của key và thêm/loại bỏ lớp turn-on
            if (data[key] === "true") {
                button.addClass('turn-on');
            } else {
                button.removeClass('turn-on');
            }

            // hiện text 
            if (key === "temperature") {
                $('#temperature').html(`NHIỆT ĐỘ: ${data.temperature} độ C`);
            }
            if (key === "fullname" || key == "username") {
                $(buttonId).html(data[key]);
            }

            $('#' + key).attr('value', data[key]);

            //bật tắt âm thanh
            if (key === "sos" && data[key] == "true") {
                playAudio(audioSOS, './mp3/sos.mp3');
            } else if (key === "sos" && data[key] == "false") {
                stopAudio(audioSOS);
            }
            if (key === "alert" && data[key] == "true") {
                playAudio(audioAlert, './mp3/alert.mp3');
            } else if (key === "alert" && data[key] == "false") {
                stopAudio(audioAlert);
            }
        }
    }
}
function getAllValues() {
    var values = {};

    // Duyệt qua mảng các ID và lấy giá trị từ các thẻ tương ứng
    var ids = [
        'area1', 'area2', 'area3', 'area4', 'area5',
        'area6', 'area7', 'area8', 'sos', 'alert', 'temperature', 'fullname', 'username', 'password'
    ];

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        var value = $('#' + id).attr("value");
        values[id] = value;

        if (value === undefined) {
            if (id == 'temperature' || id == 'fullname' || id == 'username' || id == 'password') {
                values[id] = 'N/A';
            } else {
                values[id] = 'false';
            }
        }
    }

    return values;
}
function getAllValuesAndCallApi(message) {
    // Lấy giá trị từ tất cả các thẻ button
    var values = getAllValues();

    if (!localStorage.getItem("isLogin")) {
        window.location.href = routeLogin;
    }

    // Gọi API để cập nhật dữ liệu trên server
    $.ajax({
        url: 'https://database-app-android-4c845-default-rtdb.firebaseio.com/' + keyUser + '.json',
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(values),
        success: function (response) {
            Swal.fire({
                position: "center",
                icon: "success",
                title: message,
                showConfirmButton: false,
                timer: 1500
            });
        },
        error: function (error) {
            console.error('Error updating data:', error);
            Swal.fire({
                position: "center",
                icon: "warning",
                title: JSON.stringify(error),
                showConfirmButton: false,
                timer: 1500
            });
        }
    });
}

function playAudio(audioObject, linkMp3) {
    if (!audioObject.audio) {
        audioObject.audio = new Audio(linkMp3);
        audioObject.audio.addEventListener('ended', function () {
            this.currentTime = 0;
            this.play();
        }, false);
    }
    audioObject.audio.play();
}

function stopAudio(audioObject) {
    if (audioObject.audio && !audioObject.audio.paused) {
        audioObject.audio.pause();
        audioObject.audio.currentTime = 0;
    }
}


// change info

// fullnameEdit
// passwordOldEdit
// passwordNewEdit
// passwordNewConfirmEdit

var btnChangeInfo             = $('#btnChangeInfo');
var frmInfoEditUser           = $('#frmInfoEditUser');
var messNotFill               = 'Vui lòng điền đầy đủ thông tin';
var messPassNewAndConfirmDiff = 'Xác nhận mật khẩu không giống mật khẩu mới';
var failConnectDatabase       = "Kết nối database thất bại, vui lòng thử lại !";
var wrongPassword             = "Sai mật khẩu";
var success                   = "Thành công";
var allDataFrm = {};

btnChangeInfo.click(async function (e) {
    e.preventDefault();
    allDataFrm = frmInfoEditUser.serializeArray();

    var formDataJson = {};
    $.each(allDataFrm, function(index, field) {
        formDataJson[field.name] = field.value;
    });

    // validate from
    if (validateForm(formDataJson)) return;

    // check pass 
    if (await validatePassOld(formDataJson)) return;
    
    getAllValuesAndCallApiUpdateInfo(success, formDataJson);
});

function validateForm(formDataJson) {
    var isMessageError = null;
    $.each(formDataJson, function (index, value) {
        if (!value) {
            isMessageError = messNotFill;
            return false;
        }
    });
    if (isMessageError) {
        notiMessage(isMessageError);
    }
    // [2] mk mới, [3] xác nhận mk mới 
    if (formDataJson.passwordNewEdit != formDataJson.passwordNewConfirmEdit) {
        isMessageError = messPassNewAndConfirmDiff;
        notiMessage(isMessageError);
    }
    return isMessageError ? true : false;
}
async function validatePassOld(formDataJson) {
    try {
        var isMessageError = null;
        var passOld = formDataJson.passwordOldEdit;

        if (!localStorage.getItem("isLogin")) {
            window.location.href = routeLogin;
        }

        // Wrap the jQuery AJAX call in a Promise
        const data = await new Promise((resolve, reject) => {
            $.ajax({
                url: 'https://database-app-android-4c845-default-rtdb.firebaseio.com/' + keyUser + '.json',
                type: 'GET',
                dataType: 'json',
                success: function (responseData) {
                    resolve(responseData);
                },
                error: function (error) {
                    reject(error);
                }
            });
        });

        // Check password and set error message
        if (data.password !== passOld) {
            isMessageError = wrongPassword;
            notiMessage(isMessageError);
        }

        return isMessageError ? true : false;
    } catch (error) {
        notiMessage(failConnectDatabase);
        return true;
    }
}
function getAllValuesAndCallApiUpdateInfo(message, formDataJson) {
    // Lấy giá trị từ tất cả các thẻ button
    var values = getAllValues();
    values.fullname = formDataJson.fullnameEdit;
    values.password = formDataJson.passwordNewEdit;

    if (!localStorage.getItem("isLogin")) {
        window.location.href = routeLogin;
    }
    
    // Gọi API để cập nhật dữ liệu trên server
    $.ajax({
        url: 'https://database-app-android-4c845-default-rtdb.firebaseio.com/' + keyUser + '.json',
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(values),
        success: function (response) {
            notiMessage(message, icon = "success")
            frmInfoEditUser.find('input, textarea, select').val('');
        },
        error: function (error) {
            console.error('Error updating data:', error);
            notiMessage(JSON.stringify(error));
        }
    });
}

function notiMessage(isMessageError, icon = "warning") {
    Swal.fire({
        position: "top",
        icon: icon,
        title: isMessageError,
        showConfirmButton: false,
        timer: 1500
    });
}



$("#btnLogout").on("click", function() {
    // Check if isLogin exists in localStorage
    if (localStorage.getItem("isLogin")) {
        localStorage.removeItem("isLogin");
        window.location.href = routeLogin;
    } else {
        notiMessage('User chưa login !', icon = "warning") 
    }
});