var USER_NOT_EXSIT = "User không tồn tại";
var PASS_NOT_FALSE = "Mật khẩu không đúng";
var routeHone      = "/";

var inP = $(".input-field");
$(document).ready(function () {
    // Hiển thị loading khi trang được tải
    var containerLoading = $('.container-loading');
    var containerContent = $('.container-content');

    // Thực hiện gọi API bằng AJAX
    setTimeout(() => {
        containerLoading.hide();
        containerContent.show();
    }, 1000);
});

inP
    .on("blur", function () {
        if (!this.value) {
            $(this).parent(".f_row").removeClass("focus");
        } else {
            $(this).parent(".f_row").addClass("focus");
        }
    })
    .on("focus", function () {
        $(this).parent(".f_row").addClass("focus");
        $(".btn").removeClass("active");
        $(".f_row").removeClass("shake");
    });

$(".resetTag").click(function (e) {
    e.preventDefault();
    $(".formBox").addClass("level-forget").removeClass("level-reg");
});

$(".back").click(function (e) {
    e.preventDefault();
    $(".formBox").removeClass("level-forget").addClass("level-login");
});

$(".regTag").click(function (e) {
    e.preventDefault();
    $(".formBox").removeClass("level-reg-revers");
    $(".formBox").toggleClass("level-login").toggleClass("level-reg");
    if (!$(".formBox").hasClass("level-reg")) {
        $(".formBox").addClass("level-reg-revers");
    }
});
$(".btn-confirm").each(function () {
  
   
    $(this).on("click", async function (e) {
        e.preventDefault();

        var userName = $('#username').val().trim();
        var password = $('#password').val().trim();

        var finp = $(this).parent("form").find("input");

        if (!finp.val() == 0) {

            if (await validatePass(userName, password)) return;
            $(this).addClass("active");
            window.location.href = routeHone;
            localStorage.setItem("isLogin", userName);
        }

        inP.val("");

        $(".f_row").removeClass("shake focus");
        $(".btn").removeClass("active");

        if (inP.val() == 0) {
            inP.parent(".f_row").addClass("shake");
        }
        //inP.val('');
        //$('.f_row').removeClass('focus');
    });    
});

async function validatePass(userName, password) {
    try {
        var isMessageError = null;

        // Wrap the jQuery AJAX call in a Promise
        const data = await new Promise((resolve, reject) => {
            $.ajax({
                url: 'https://database-app-android-4c845-default-rtdb.firebaseio.com/' + userName + '.json',
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
        if(data == null){
            isMessageError = USER_NOT_EXSIT;
            notiMessage(isMessageError);
            // showAlert(isMessageError,'warning')

        }else if (data.password !== password) {
            isMessageError = PASS_NOT_FALSE;
            notiMessage(isMessageError);
            // showAlert(isMessageError,'warning')
        }

        return isMessageError ? true : false;
    } catch (error) {
        notiMessage(failConnectDatabase);
        // showAlert(failConnectDatabase,'warning')
        return true;
    }
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


// register 
var messNotFill               = 'Vui lòng điền đầy đủ thông tin';
var messPassNewAndConfirmDiff = 'Xác nhận mật khẩu không giống mật khẩu';
var failConnectDatabase       = "Kết nối database thất bại, vui lòng thử lại !";
var wrongPassword             = "Sai mật khẩu";
var success                   = "Thành công";
var allDataFrm         = {};
var usernameReg        = $('#usernameReg');
var passwordReg        = $('#passwordReg');
var passwordConfirmReg = $('#passwordConfirmReg');
var btnReg             = $('#btnReg');
var frmInfoReg         = $('#frmInfoReg');
var btnChangeReg       = $('.btnChangeReg');


btnReg.click(async function (e) {
    e.preventDefault();
    allDataFrm = frmInfoReg.serializeArray();

    var formDataJson = {};
    $.each(allDataFrm, function(index, field) {
        formDataJson[field.name] = field.value;
    });
    // validate from
    if (validateFormReg(formDataJson)) return;

    getAllValuesAndCallApiCreateUser(success, formDataJson);
});

function getAllValuesAndCallApiCreateUser(message, formDataJson) {

    var usernameReg        = $('#usernameReg').val();
    var usernameRegId      = $('#usernameReg').attr("value");
    var values = getAllValues();
    values.username = usernameReg;
    values.password = formDataJson['passwordReg'];

    // Gọi API để cập nhật dữ liệu trên server
    $.ajax({
        url: 'https://database-app-android-4c845-default-rtdb.firebaseio.com/' + usernameReg + '.json',
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(values),
        success: function (response) {
            notiMessage(message, icon = "success");
            // showAlert(message,'success')
            frmInfoReg.find('input, textarea, select').val('');
            frmInfoReg.click();
            $.ajax({
                url: 'https://database-app-android-4c845-default-rtdb.firebaseio.com/config.json',
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    "userIdCurrent": parseInt(usernameRegId) + 1
                }),
                success: function (response) {
                },
                error: function (error) {
                    console.error('Error updating data:', error);
                    notiMessage(JSON.stringify(error));
                    // showAlert(JSON.stringify(error),'warning')
                }
            });
        },
        error: function (error) {
            console.error('Error updating data:', error);
            notiMessage(JSON.stringify(error));
            // showAlert(JSON.stringify(error),'warning')
        }
    });

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


function validateFormReg(formDataJson) {
    var isMessageError = null;
    $.each(formDataJson, function (index, value) {
        if (!value) {
            isMessageError = messNotFill;
            return false;
        }
    });
    if (isMessageError) {
        notiMessage(isMessageError);
        // showAlert(isMessageError,'warning')
    }
    // [2] mk mới, [3] xác nhận mk mới 
    if (formDataJson.passwordReg != formDataJson.passwordConfirmReg) {
        isMessageError = messPassNewAndConfirmDiff;
        notiMessage(isMessageError);
        // showAlert(isMessageError,'warning')
    }
    return isMessageError ? true : false;
}

btnChangeReg.click(async function (e) {
    $('.addFocus').addClass('focus');
    try {
        var isMessageError = null;
        // Wrap the jQuery AJAX call in a Promise
        const data = await new Promise((resolve, reject) => {
            $.ajax({
                url: 'https://database-app-android-4c845-default-rtdb.firebaseio.com/config.json',
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
        if (!data) {
            isMessageError = failConnectDatabase;
            notiMessage(failConnectDatabase);
            // showAlert(failConnectDatabase,'warning')
        }
        usernameReg.val('user'+data['userIdCurrent']);
        usernameReg.attr('value', data['userIdCurrent']);

    } catch (error) {
        notiMessage(failConnectDatabase);
        // showAlert(failConnectDatabase,'warning')
    }
});


function showAlert(message, alertType = "success") {
    // Create an alert element
    var alertElement = document.createElement("div");
    alertElement.classList.add("alert", "alert-" + alertType, "position-fixed", "top-0", "w-100", "text-center", "m-0");
    alertElement.setAttribute("role", "alert");
    alertElement.innerHTML = message;

    // Append the alert to the body
    document.querySelector('.messError').appendChild(alertElement);
    document.querySelector('.messError').style.setProperty("display", "flex", "important");

    // Set a timeout to remove the alert after a few seconds
    setTimeout(function () {
        alertElement.remove();
        document.querySelector('.messError').style.setProperty("display", "none", "important");
    }, 3000); // Adjust the timeout as needed
}