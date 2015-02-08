var request = require('request');
var cheerio = require('cheerio');

var login_id = 'censored@censored.com';
var password = 'censored';

request('https://www.dmm.com/my/-/login/', function (error, response, body) { 
    if (!error  && response.statusCode == 200) { 
        var dmm_token = body.split(/DMM_TOKEN.*?"([a-z0-9]{32})"/)[1];
        var post_data = body.split(/token.*?"([a-z0-9]{32})"/)[3];
        console.log('DMM TOKEN: ' + dmm_token); // dmm token
        console.log('POST DATA TOKEN: ' + post_data); // post data token
    }
    
    var $ = cheerio.load(body);
    
    var id_token = $('input#id_token').val();
//    var login_id = $('input#login_id').val();
//    var password = $('input#password').val();
    
    console.log('id_token: ' + id_token);
    console.log('login_id: ' + login_id);
    console.log('password: ' + password);
    
    request({
        url: 'https://www.dmm.com/my/-/login/ajax-get-token/',
        method: 'POST',
        headers: {
            'DMM_TOKEN': dmm_token,
            'X-Requested-With': 'XMLHttpRequest'
        },
        form: {
            "token": post_data
        }
    }, function(error, response, xhrbody) {
        if (error) {
            console.log(error);
        } else {
            console.log(xhrbody);
            // token success, now will login
            xhrbody = JSON.parse(xhrbody);
            var login_id_token = xhrbody['login_id'];
            var login_password_token = xhrbody['password']
            var login_formdata = {
                    "token": xhrbody.token,
                    "login_id": login_id,
                    "save_login_id": 0,
                    "password": password,
                    "use_auto_login": 0,
                };
            login_formdata[login_id_token] = login_id;
            login_formdata[login_password_token] = password;
            request({
                url: 'https://www.dmm.com/my/-/login/auth/',
                method: 'POST',
                form: login_formdata
            }, function(error, response, logindata) {
                if (!error) {
                    
                    // var sescookie = response.headers['set-cookie'][5].split(';')[0];
                    var cookie = '';
                    response.headers['set-cookie'].forEach(function(cookieString) {
                        cookie += cookieString.split(';')[0] + ';';
                    });
                    request({
                        url: 'http://www.dmm.com/netgame/social/-/gadgets/=/app_id=854854/', 
                        headers: {
                            'Cookie': cookie
                        }
                    }, function (error, response, htmlbody) {
                        if (!error) {
                            // console.log(htmlbody);
                            $ = cheerio.load(htmlbody);
                            var link = $('iframe#game_frame').attr('src');
                            console.log('Login success! Use the following link to play:');
                            console.log(link);
                        }
                    });                    
                }
            });
        }
    });
    
});
