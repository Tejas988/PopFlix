const bcrypt = require("bcryptjs");
const passport = require("passport");
const query = require("../util/db").query();

exports.getProfile = (req, res) => {
  res.render("User/Profile", {
    pg: "profile",
  });
};

exports.signup = async (req, res) => {
  let { name, email, psw, phone, gender } = req.body;
  let pass2 = req.body["psw-repeat"];
  if (psw !== pass2) {
    //! TODO Error page
  }
  try {
    let salt = bcrypt.genSaltSync(15);
    let hash = bcrypt.hashSync(psw, salt);

    let res = await query(
      `INSERT INTO person (name,gender) values ("${name}","${gender}");`
    );
    const id = res.insertId;
    res = await query(
      `INSERT INTO customer (p_id,Email,Phone,password) values (${id},"${email}","${phone}","${hash}");`
    );
    let user = {
      email: email,
      password: hash,
      p_id: id,
    };

    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      // TODO render user profile with correct data
    });
  } catch (e) {
    //! TODO Error handling
    console.log(e);
  }
};

exports.login = async (req, res, next) => {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.render("Error/error", { pg: "error", error: info.message });
      return;
    }
    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/user/profile");
      return;
    });
  })(req, res, next);
};
