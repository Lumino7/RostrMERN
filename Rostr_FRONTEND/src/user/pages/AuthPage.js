import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RostrContext } from "../../shared/context/rostr-context";
import { useCallback } from "react";

const AuthPage = () => {
  const {
    isLoggedIn,
    setIsLoggedIn,
    token,
    setToken,
    activeUser,
    setActiveUser,
  } = useContext(RostrContext);

  const [isRegMode, setIsRegMode] = useState(false);

  const [formData, setFormData] = useState(
    isRegMode
      ? { email: "", password: "", firstName: "", lastName: "" }
      : { email: "", password: "" },
  );

  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const validateInputs = () => {
    let isInputsValid = true;
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      alert("Please enter a valid email address");
      return (isInputsValid = false);
    }
    if (formData.password.length < 6) {
      alert("Password must be longer than 6 characters.");
      return (isInputsValid = false);
    }
    for (const [key, value] of Object.entries(formData)) {
      if (value.length < 1) {
        alert("All fields required.");
        return (isInputsValid = false);
      }
    }
    return isInputsValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isInputsValid = validateInputs();
    if (isRegMode && isInputsValid) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/users/signup`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          },
        );
        if (response.ok) {
          alert("Registration successful!");
          const responseData = await response.json();
          login(responseData);
        } else {
          const errorData = await response.json();
          alert(errorData.message || "Something went wrong.");
        }
      } catch (err) {
        alert(err);
      }
    } else if (!isRegMode && isInputsValid) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/users/login`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          },
        );
        if (response.ok) {
          alert("Login successful!");
          const responseData = await response.json();
          login(responseData);
        } else {
          const errorData = await response.json();
          alert(errorData.message || "Something went wrong.");
        }
      } catch (err) {
        alert(err);
      }
    }
  };

  const login = useCallback(
    (data) => {
      setToken(data.token);

      setActiveUser((prev) => {
        return {
          ...prev,
          userId: data.userId,
          userRole: data.userRole,
          userFirstName: data.userFirstName,
        };
      });
      localStorage.setItem(
        "userData",
        JSON.stringify({
          userId: data.userId,
          userRole: data.userRole,
          userFirstName: data.userFirstName,
          token: data.token,
        }),
      );
      setIsLoggedIn(!!data.token);
      navigate("/schedule");
    },
    [navigate, setActiveUser, setIsLoggedIn, setToken],
  );

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("userData"));
    if (storedData && storedData.token) {
      login(storedData);
    }
  }, [login]);

  let authButtonValue = isRegMode ? "Register" : "Login";

  return (
    <>
      <div className="container-fluid my-auto py-5 text-center">
        <img
          src="/logo.png"
          className="img-fluid mx-auto mb-3 d-block"
          style={{ width: "50%" }}
          alt="logo"
        />
        <form onSubmit={handleSubmit}>
          <div className="form-group col-4 mx-auto p-2">
            <input
              className="form-control"
              type="email"
              name="email"
              placeholder="Email Address"
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group col-4 mx-auto p-2">
            <input
              className="form-control"
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleInputChange}
            />
          </div>
          {isRegMode && (
            <>
              <div className="form-group col-4 mx-auto p-2">
                <input
                  className="form-control"
                  type="password"
                  name="confirmation"
                  placeholder="Confirm Password"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group col-4 mx-auto p-2">
                <input
                  className="form-control"
                  autoFocus
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group col-4 mx-auto p-2">
                <input
                  className="form-control"
                  autoFocus
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  onChange={handleInputChange}
                  required
                />
              </div>
            </>
          )}
          <input
            className="btn btn-primary"
            type="submit"
            value={authButtonValue}
          />
        </form>
      </div>

      <div className="col-4 mx-auto p-2 text-center">
        {!isRegMode && (
          <div>
            Don't have an account?{" "}
            <div
              style={{ textDecoration: "underline", cursor: "pointer" }}
              className="auth"
              onClick={() => setIsRegMode(true)}
            >
              Register here.
            </div>
          </div>
        )}
        {isRegMode && (
          <div>
            Already have an account?{" "}
            <div
              style={{ textDecoration: "underline", cursor: "pointer" }}
              className="auth"
              onClick={() => setIsRegMode(false)}
            >
              Login instead
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AuthPage;
