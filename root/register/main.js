var socket = io.connect('http://localhost');
var userIP;


function getIP(json) {
  userIP = json.ip;
}

function setup() {
  let registerButton = document.getElementById('register-button');
  registerButton.addEventListener('click', () => {
    let username = document.getElementById('register-username').value;
    let password = document.getElementById('register-password').value;
    if (!username || !password) {
      alert('Please fill in both fields.')
      return;
    }
    socket.emit('register-attempt', {
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