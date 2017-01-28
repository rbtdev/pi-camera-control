$(document).ready(function () {

    $("#login-button").on('click', login)

    $(document).on("keyup",
        function (event) {
            if (event.which == 13) {
                $("#login-button").trigger('click');
            }
        });
});

function login() {
    var username = $("#username").val().trim();
    var password = $("#password").val().trim();
    if (username.length > 0 && password.length > 0) {
        $.post("/login", {
                username: username,
                password: password
            })
            .done(function () {
                window.location = "/";
            })
            .fail(function (resp) {
                var message = "Please try again"
                var data = resp.responseJSON
                if (data.errors.length) {
                    message = data.errors[0]
                }
                $("#message").text(message);
            })
    } else {
        $("#message").text("Please enter username and password")
    }
}