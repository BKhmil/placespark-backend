import * as React from "react";

interface IProps {
  context: {
    frontUrl: string;
    actionToken: string;
  };
}

export const ForgotPasswordEmail: React.FC<Readonly<IProps>> = ({
  context,
}) => {
  return (
    <div>
      <h1>Do not worry, your password is under control!</h1>

      <p>You need to restore password, please click on the button</p>

      <a
        href={
          context.frontUrl +
          "/auth/password/restore?token=" +
          context.actionToken
        }
      >
        RESTORE PASSWORD
      </a>

      <p>or copy the link and paste it into your browser.</p>

      <a
        href={
          context.frontUrl + "/auth/password/restore?token=" + context.actionToken
        }
        target="_blank"
        style={{
          color: "#A981DC",
        }}
      >
        {context.frontUrl + "/auth/password/restore?token=" + context.actionToken}
      </a>
    </div>
  );
};
