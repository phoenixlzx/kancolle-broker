var express = require('express');
var router = express.Router();

var validator = require('validator');
var request = require('request');
var cheerio = require('cheerio');

router.get('/', function(req, res) {
    res.render('index');
});

router.post('/login', function(req, res) {
    // security check
    var login_id = req.body.login_id + '';
    var password = req.body.password + '';
    var rcookie = req.body.cookie;
    if (rcookie != '' && rcookie != null){
      console.log("with cookie"+ rcookie);
      request({
        url: 'http://www.dmm.com/netgame/social/-/gadgets/=/app_id=854854/',
        headers: {
          'Cookie': rcookie
        }
      }, function (error, response, htmlbody) {
        if (!error) {
          $ = cheerio.load(htmlbody);
          var link = $('iframe#game_frame').attr('src');
          // res.redirect(link);
          if(link){
            res.json({
              cookie: rcookie,
              url: link
            })
          }else{
            console.log("url undefined");
            return res.send(500, 'Internal Server Error.');
          }
        } else {
          console.log(error);
          return res.send(500, 'Internal Server Error.');
        }
      });
    } else if (validator.isEmail(login_id)) {
        console.log("without cookie");
        request('https://www.dmm.com/my/-/login/', function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var dmm_token = body.split(/DMM_TOKEN.*?"([a-z0-9]{32})"/)[1];
                var post_data = body.split(/token.*?"([a-z0-9]{32})"/)[3];
            } else {
                console.log(error);
                return res.send(500, 'Internal Server Error.');
            }

            var $ = cheerio.load(body);

            var id_token = $('input#id_token').val();

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
                    return res.send(500, 'Internal Server Error.');
                } else {
                    xhrbody = JSON.parse(xhrbody);
                    var login_id_token = xhrbody['login_id'];
                    var login_password_token = xhrbody['password'];
                    var login_formdata = {
                            "token": xhrbody.token,
                            "login_id": login_id,
                            "save_login_id": 0,
                            "password": password,
                            "use_auto_login": 0
                        };
                    login_formdata[login_id_token] = login_id;
                    login_formdata[login_password_token] = password;
                    request({
                        url: 'https://www.dmm.com/my/-/login/auth/',
                        method: 'POST',
                        form: login_formdata
                    }, function(error, response, logindata) {
                        if (!error && response.statusCode === 302) {
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
                                    $ = cheerio.load(htmlbody);
                                    var link = $('iframe#game_frame').attr('src');
                                    // res.redirect(link);
                                    res.json({
                                      cookie: cookie,
                                      url: link
                                    })
                                } else {
                                  console.log(error);
                                  return res.send(500, 'Internal Server Error.');
                                }
                            });
                        } else if (response.statusCode === 200) {
                            // login failed
                            return res.send(403, 'Login failed.');
                        } else {
                            console.log(error);
                            return res.send(500, 'Internal Server Error.');
                        }
                    });
                }
            });

        });
    } else {
        res.send(400, 'Bad request.');
    }
});

module.exports = router;
