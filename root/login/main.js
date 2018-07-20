var socket = io.connect('http://localhost');
var userIP;


function getIP(json) {
  userIP = json.ip;
}

function setup() {
  let loginButton = document.getElementById('login-button');
  loginButton.addEventListener('click', () => {
    let username = document.getElementById('login-username').value;
    let password = document.getElementById('login-password').value;
    if (!username || !password) {
      alert('Please fill in both fields.')
      return;
    }
    socket.emit('login-attempt', {
      username: username,
      password: password,
      ip: userIP
    })
  })
  console.log('Loaded')
  return (true);
}

socket.on('alert', (message) => {
  alert(message);
});