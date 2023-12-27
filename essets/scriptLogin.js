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

        }else if (data.password !== password) {
            isMessageError = PASS_NOT_FALSE;
            notiMessage(isMessageError);
        }

        return isMessageError ? true : false;
    } catch (error) {
        notiMessage(failConnectDatabase);
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


