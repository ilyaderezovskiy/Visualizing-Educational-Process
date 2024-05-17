import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import emailjs from "@emailjs/browser"

import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState(localStorage.getItem("name") === null ? "" : localStorage.getItem("name"));
  const [password, setPassword] = useState('');
  const [isRemember, setRemember] = useState('');

  const navigate = useNavigate();

  window.onload = function(e) { 
    if (localStorage.getItem("isLogin") === "1" && localStorage.getItem("userID") !== null) {
      navigate("/projects");
      }
  }

  const sendEmail = async (e) => {
    var hashPassword = "";
    var id = null

    e.preventDefault();
  
    const serviceId = 'service_1kexf0c';
    const templateId = 'template_dhjfhui';
    const userId = 'GB3LOscboADsXqKF4';

    if (email === "" || email === null) {
      alert("Введите адрес электронной почты!")
    } else {
      await axios.get('http://127.0.0.1:4000/users')
      .then(response => response.data.forEach(element => {
        if (email === element.username) {
          hashPassword = element.password
          id = element.id
          }
      }));

      if (hashPassword === "") {
        alert("Пользователь с таким адресом эл. почты не найден!");
      } else if (window.confirm("Новый пароль будет отправлен на почту: " + email)) {
        const emailParams = {
          to_name: email,
          from_name: "EduVis team",
          message: hashPassword.substring(0,8),
          reply_to: "emailverifyeduvis@gmail.com",
        };

        emailjs.send(serviceId, templateId, emailParams, userId)
        .then((result) => {
          var bcrypt = require('bcryptjs');
          var salt = bcrypt.genSaltSync(10);
          var hash = bcrypt.hashSync(hashPassword.substring(0,8), salt);

          var formdata = new FormData();

          formdata.append("username", email);
          formdata.append("password", hash);
            
          axios.put('http://127.0.0.1:4000/users/' + id, formdata);   
        }, (error) => {
          console.log(error)
        })
      }
    }
  };

  const logInUser = async () => {
    var bcrypt = require('bcryptjs');
    var hashPassword = ""
    var id = null

    await axios.get('http://127.0.0.1:4000/users')
      .then(response => response.data.forEach(element => {
        if (email === element.username) {
          hashPassword = element.password
          id = element.id
        }
      }));

    if (email.length === 0 || password.length === 0) {
      alert("Поля адреса эл. почты и пароля должны быть заполнены!");
    } else if(hashPassword === "") {
      alert("Пользователь с таким таким адресом эл. почты не найден!");
    } else if(!bcrypt.compareSync(password, hashPassword)){
      alert("Неверно задан пароль!");
    } else {
      if (isRemember) {
        localStorage.setItem("name", email)
        localStorage.setItem("id", id)
        localStorage.setItem("isLogin", "1")
      } else {
        localStorage.setItem("id", id)
        localStorage.setItem("name", email)
        localStorage.setItem("isLogin", "0")
      }

      navigate("/projects");
    }
  }

  const signUpUser = async () => {
    var users = []

    await axios.get('http://127.0.0.1:4000/users')
      .then(response => response.data.forEach(element => {
        users.push(element.username)
      }));

    if (email.length === 0 || password.length === 0) {
      alert("Поля адреса эл. почты и пароля должны быть заполнены!");
    } else if(users.includes(email)){
        alert("Пользователь с таким адресом эл. почты уже существует!");
    } else {
        var bcrypt = require('bcryptjs');
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);

        var formdata = new FormData();

        formdata.append("username", email);
        formdata.append("password", hash);
      
        axios.post('http://127.0.0.1:4000/users', formdata)
        .then(function (response) {
            if (isRemember) {
                localStorage.setItem("name", email)
                localStorage.setItem("id", response.data.id)
                localStorage.setItem("isLogin", "1")
            } else {
                localStorage.setItem("id", response.data.id)
                localStorage.setItem("name", email)
                localStorage.setItem("isLogin", "0")
            }
            navigate("/projects");
        })
        .catch(function (error) {
            if (error.response.status === 500) {
                alert("Пользователь с таким адресом эл. почты уже существует! Ошибка регистрации!");
            } else {
                alert("Ошибка регистрации!");
            }
        });
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{  
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Авторизация
        </Typography>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Эл. почта"
            name="email"
            autoComplete="email"
            value={email}
            // autoFocus
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Пароль"
            // type="password"
            id="password"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormControlLabel
            control={<Checkbox
                value={isRemember}
                color="primary"
                onChange={(e) => setRemember(!isRemember)}/>}
            label="Запомнить меня"
          />
          <Button
            fullWidth
            variant="contained"
            onClick={logInUser}
            sx={{ mt: 3, mb: 0 }}
          >
            Авторизироваться
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={signUpUser}
            sx={{ mt: 2, mb: 3 }}
          >
            Зарегистрироваться
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="#" onClick={sendEmail} variant="body2">
                Забыли пароль?
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
}