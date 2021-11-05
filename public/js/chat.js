const socket = io();
const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("#message");
const $messageFormButton = $messageForm.querySelector("#submitForm");
const $sendLocationButton = document.querySelector("#location");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sideBarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  const $newMessage = $messages.lastElementChild;

  const newMessageMargin = parseInt(getComputedStyle($newMessage).marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = $messages.offsetHeight
  const contentHeight = $messages.scrollHeight

  //how far I scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight

  if(contentHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight;
  }

};
socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm A"),
    username: message.username,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (message) => {
  const html = Mustache.render(locationTemplate, {
    url: message.url,
    createdAt: moment(message.createdAt).format("h:mm A"),
    username: message.username,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sideBarTemplate, { room, users });
  $sidebar.innerHTML = html;
});
$messageForm.addEventListener("submit", (event) => {
  event.preventDefault();

  $messageFormButton.setAttribute("disabled", "disabled");
  const message = $messageFormInput.value;
  socket.emit("sendMessage", message, (err) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    if (err) return console.log(err);

    console.log("Message Delivered!");
  });
});

$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation)
    return alert("Geolocation is not supported by your browser");

  $sendLocationButton.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit(
      "sendLocation",
      {
        latitude,
        longitude,
      },
      () => {
        $sendLocationButton.removeAttribute("disabled");
        console.log("Location shared");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
