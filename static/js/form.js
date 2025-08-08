async function sendData(url, data) {
  try {
    const response = await fetch(url, {
      method: "POST", // HTTP method
      headers: {
        "Content-Type": "application/json", // Set JSON body type
      },
      body: JSON.stringify(data), // Convert JS object to JSON
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json(); // Parse the response
    console.log("Success:", result);
  } catch (error) {
    console.error("Error:", error.message);
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
      attribute: "data-email",
      isInvalid: (input) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return !regex.test(input.value);
      },
      errorMessage: (input, label) => `${label.textContent} is not valid!`,
    },
    {
      attribute: "required",
      isInvalid: (input) => input.value.trim() == "",
      errorMessage: (input, label) => `${label.textContent} is required!`,
    },
  ];

  function validateFormGroup(formGroup) {
    const input = formGroup.querySelector("input");
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
    const formGroups = Array.from(formHandler.querySelectorAll(".formGroup"));
    let isFormValid = true;
    formGroups.forEach((formGroup) => {
      const isValid = validateFormGroup(formGroup);
      if (!isValid) {
        isFormValid = false;
      }
    });
    if (!isFormValid) {
      event.preventDefault();
    }
  }
};

validateForm("#form");
