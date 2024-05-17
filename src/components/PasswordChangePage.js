import React from "react";
import axios from 'axios';

// Проверка правильности введённого пароля
async function checkPassword() {
    var bcrypt = require('bcryptjs');
    var salt = bcrypt.genSaltSync(10);
    var oldPassword = document.getElementById('oldPassword').value;
    var newPassword = document.getElementById('newPassword').value;
    var newEmail = document.getElementById('newEmail').value;
    var isCorrect = false;

    await axios.get('http://127.0.0.1:4000/users/' + localStorage.getItem("id"))
    .then(async response => {
        if (bcrypt.compareSync(oldPassword, response.data.user.password)) {
            if (newPassword.length < 5) {
                alert("Длина пароля должна быть больше 4 символов!");
            } else {
                var formdata = new FormData();

                if (newEmail.length > 0) {
                    await axios.get('http://127.0.0.1:4000/users')
                    .then(response => response.data.forEach(element => {
                        if (newEmail === element.username) {
                            isCorrect = true;
                        }
                    }));
                    if (isCorrect) {
                        alert("Пользователь с таким email уже найден!");
                    } else {
                        formdata.append("username", newEmail);
                        formdata.append("password", bcrypt.hashSync(newPassword, salt));
                        
                        axios.put('http://127.0.0.1:4000/users/' + localStorage.getItem("id"), formdata);
                        alert("Пароль успешно изменён!");
                    }
                } else {
                    formdata.append("username", localStorage.getItem("name"));
                    formdata.append("password", bcrypt.hashSync(newPassword, salt));
                    
                    axios.put('http://127.0.0.1:4000/users/' + localStorage.getItem("id"), formdata);
                    alert("Пароль успешно изменён!");
                }
            }
        } else {
            alert("Старый пароль введён не верно!");
        }
    });
}

// Экран смены пароля
const PasswordChangePage = () => {

  return (
    <>
      {
        <>
            <>
                <p style={{ padding: "15px" }}>Старый пароль:</p>
                <input style={{ margin: "10px", height: "30px", width: "400px" }} id="oldPassword" />
            </>
            <p style={{ padding: "15px" }}>Новый пароль:</p>
            <input style={{ margin: "10px", height: "30px", width: "400px" }} id="newPassword" />
            <p style={{ padding: "15px" }}>Новый адрес электронной почты (опционально):</p>
            <input style={{ margin: "10px", height: "30px", width: "400px" }} id="newEmail" />
            <button onClick={checkPassword} style={{ padding: "7px", margin: "10px" }}>Сменить пароль</button>
        </>
      }
    </> 
  );
};

export default PasswordChangePage;