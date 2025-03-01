export const generatePassword = (id) => {
  const expirationTime = Date.now() + 180000; // 3 min expiration
  console.log(expirationTime);
  const link = `http://localhost:3000/set-password/${id}?expiresAt=${expirationTime}`;
  console.log(link);

  return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Welcome to our Ecommerce Website</h1>
        <p>
          We’re excited to have you on board! Please click the button below to set your password.
        </p>
        <div style="margin: 20px 0;">
          <a
            href="${link}"
            style="
              display: inline-block;
              padding: 10px 20px;
              background-color: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 5px;
            "
            target="_blank"
          >
            Set Your Password
          </a>
        </div>        
        <p>Thank you,</p>
        <p>The Ecommerce Team</p>
      </div>
    `;
};
