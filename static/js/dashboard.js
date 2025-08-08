const sidebar = document.querySelector("#sidebar");
const sideToggle = document.querySelector(".mobile-sidebar-toggle");
const connectBtn = document.querySelector(".connect");
const statusDot = document.querySelector(".status");
const closeBtn = document.querySelector("#close");
const overlay = document.querySelector(".overlay");
const modalContent = document.querySelector(".content");
const alert = document.querySelector(".alert");
const mainPages = document.querySelectorAll(".page");
const getPrint = document.getElementById("getPrint");
const inputFingerPrint = document.getElementById("fingerprint");
const form = document.getElementById("form");
const mainContainer = document.querySelector(".main-container");

const createDeviceDiv = (device) => {
  const newDiv = document.createElement("div");
  const newParagragh = document.createElement("p");
  const loading = document.createElement("div");
  const newButton = document.createElement("button");

  newParagragh.textContent = device.device_id;
  loading.classList.add("dots");
  loading.innerHTML = `
    <span style="--i:1;"></span>
    <span style="--i:2;"></span>
    <span style="--i:3;"></span>
    <span style="--i:4;"></span>
    <span style="--i:5;"></span>
    <span style="--i:6;"></span>
    <span style="--i:7;"></span>
    <span style="--i:8;"></span>
    <span style="--i:9;"></span>
    <span style="--i:10;"></span>
  `;
  newButton.textContent = "connect";
  newButton.classList.add("device-btn");
  newButton.setAttribute("data-device_id", device.device_id);
  newButton.addEventListener("click", async () => {
    loading.classList.add("show");
    try {
      const resp = await fetch(`/devices/${device.device_id}`);

      if (!resp.ok) throw new Error(`HTTP Error ${resp.status}`);

      const alertMessage = alert.querySelector(".alert-message");
      alertMessage.textContent = "Device connected successfully";
      alert.classList.add("alert-success", "fade-out");
      statusDot.classList.add("connected");
      const data = resp.json();
      console.log(data);
    } catch (err) {
      const alertMessage = alert.querySelector(".alert-message");
      alertMessage.textContent = err + ". Device offline";
      statusDot.classList.remove("connected");
      alert.classList.add("alert-error", "fade-out");
    } finally {
      loading.classList.remove("show");
      alert.addEventListener("animationend", () => {
        alert.classList.remove("alert-success", "alert-error", "fade-out");
      });
    }
  });
  newDiv.appendChild(newParagragh);
  newDiv.appendChild(loading);
  newDiv.appendChild(newButton);

  return newDiv;
};

const connectBtnHandler = async function () {
  overlay.classList.add("active");
  modalContent.innerHTML = "";
  try {
    const resp = await fetch("/devices");

    if (!resp.ok) {
      throw new Error("Something went wrong!");
    }

    const data = await resp.json();
    if (data.length)
      data.forEach((device) => {
        const newDevice = createDeviceDiv(device);
        modalContent.appendChild(newDevice);
      });
    else {
      modalContent.innerHTML = "<p>There are no available devices</p>";
    }
  } catch (error) {
    console.log(error);
    modalContent.innerHTML = '<p class="error">Something went wrong!!!</p>';
  }
};

connectBtn.addEventListener("click", connectBtnHandler);

overlay.addEventListener("click", (e) => {
  if (
    e.target === overlay ||
    (e.target.hasAttribute("id") && e.target.getAttribute("id") == "close")
  )
    overlay.classList.remove("active");
});

sideToggle.addEventListener("click", () => {
  const visibility = sidebar.getAttribute("data-visible");

  if (visibility === "false") {
    sidebar.setAttribute("data-visible", true);
    sideToggle.setAttribute("aria-expanded", true);
  } else {
    sidebar.setAttribute("data-visible", false);
    sideToggle.setAttribute("aria-expanded", false);
  }
});

sidebar.addEventListener("click", (e) => {
  if (e.target.classList.contains("dash-link")) {
    const pageID = e.target.getAttribute("data-page");
    const page = document.getElementById(pageID);
    const dashLinks = sidebar.querySelectorAll(".dash-link");
    if (!e.target.classList.contains("current")) {
      dashLinks.forEach((link) => {
        link.classList.remove("current");
      });
      e.target.classList.add("current");
    }

    mainPages.forEach((page) => {
      page.classList.remove("current");
    });
    page.classList.add("current");
  }
});

getPrint.addEventListener("click", async (e) => {
  const overlay = mainContainer.querySelector(".overlay");

  e.preventDefault();
  const errorContainer =
    e.target.parentElement.parentElement.querySelector(".errorContainer");

  overlay.classList.add("active");
  try {
    const resp = await fetch("/fingerprint");
    const data = await resp.json();

    overlay.classList.remove("active");
    if (!resp.ok) throw new Error(data.error);

    inputFingerPrint.value = data.fingerprint;
    errorContainer.textContent = "";
  } catch (error) {
    errorContainer.textContent = error;
  }
});

async function sendData(url, data) {
  const alert = mainContainer.querySelector(".alert");
  const alertMessage = alert.querySelector(".alert-message");
  const overlay = mainContainer.querySelector(".overlay");

  overlay.classList.add("active");
  try {
    const response = await fetch(url, {
      method: "POST", // HTTP method
      headers: {
        "Content-Type": "application/json", // Set JSON body type
      },
      body: JSON.stringify(data), // Convert JS object to JSON
    });

    overlay.classList.remove("active");
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message);
    }

    // Parse the response
    alertMessage.textContent = `Attendee [${result.matric_no} successfully enrolled`;
    alert.classList.add("alert-success", "fade-out");
    alert.addEventListener("animationend", () => {
      alert.classList.remove("alert-success", "fade-out");
    });
    console.log("Success:", result);
    return true;
  } catch (error) {
    alertMessage.textContent = error.message;
    alert.classList.add("alert-error", "fade-out");
    alert.addEventListener("animationend", () => {
      alert.classList.remove("alert-error", "fade-out");
    });
    console.error("Error:", error.message);
    return false;
  }
}

const validateForm = (selector) => {
  const formHandler = document.querySelector(selector);

  formHandler.setAttribute("novalidate", "");
  formHandler.addEventListener("submit", validateFormGroups);

  const options = [
    {
      attribute: "minlength",
      isInvalid: (input) =>
        !input.value || input.value.length < parseInt(input.minLength, 10),
      errorMessage: (input, label) =>
        `${label.textContent} should be atleast ${parseInt(
          input.minLength,
          10
        )}!`,
    },
    {
      attribute: "required",
      isInvalid: (input) => input.value.trim() == "",
      errorMessage: (input, label) => `${label.textContent} is required!`,
    },
  ];

  function validateFormGroup(formGroup) {
    const input = formGroup.querySelector("input, select");
    const label = formGroup.querySelector("label");
    const errorContainer = formGroup.querySelector(".errorContainer");

    let isError = false;
    for (const option of options) {
      if (input.hasAttribute(option.attribute) && option.isInvalid(input)) {
        isError = true;
        errorContainer.textContent = option.errorMessage(input, label);
      }
    }

    if (!isError) {
      errorContainer.textContent = "";
    }

    return !isError;
  }

  function validateFormGroups(event) {
    event.preventDefault();
    const formGroups = Array.from(formHandler.querySelectorAll(".formGroup"));
    let isFormValid = true;
    formGroups.forEach((formGroup) => {
      const isValid = validateFormGroup(formGroup);
      if (!isValid) {
        isFormValid = false;
      }
    });
    if (isFormValid) {
      target = event.target;
      sendData("/enroll", Object.fromEntries(new FormData(event.target))).then(
        (res) => {
          if (res) {
            target.reset();
          }
        }
      );
    }
  }
};

validateForm("#form");
