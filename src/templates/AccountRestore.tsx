import * as React from "react";

interface IProps {
  context: {
    frontUrl: string;
    actionToken: string;
  };
}

export const AccountRestoreEmail: React.FC<Readonly<IProps>> = ({
  context,
}) => {
  return (
    <div>
      <h1>Restore your account</h1>

      <p>For restoring, please click on the button</p>

      <a
        href={
          context.frontUrl +
          "/auth/account/restore?token=" +
          context.actionToken
        }
      >
        RESTORE ACCOUNT
      </a>

      <p>or copy the link and paste it into your browser.</p>

      <a
        href={
          context.frontUrl +
          "/auth/account/restore?token=" +
          context.actionToken
        }
        target="_blank"
        style={{
          color: "#A981DC",
        }}
      >
        {context.frontUrl +
          "/auth/account/restore?token=" +
          context.actionToken}
      </a>
    </div>
  );
};

// todo: add more templates for other scenarios
