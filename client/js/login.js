$(document).ready(function () {

    $("#login-button").on('click', login)
    $("#password").on("keyup", function (event) {
        if ($("#password").val().length > 72) {
            $("#message").text('Password must be less than 72 characters');
        } else {
            $("#message").text('');
        }
    })

    $(document).on("keyup",
        function (event) {
            if (event.which === 13) {
                login();
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
                var message = "Please try later"
                if (resp.responseJSON && resp.responseJSON.errors && resp.responseJSON.errors.length) {
                    message = resp.responseJSON.errors[0];
                }
                console.log(JSON.stringify(resp, null, 2))
                $("#message").text(message);
            })
    } else {
        $("#message").text("Please enter username and password")
    }
}