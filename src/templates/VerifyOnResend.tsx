import * as React from "react";

interface IProps {
  context: {
    name: string;
    frontUrl: string;
    actionToken: string;
  };
}

export const VerifyOnResendEmail: React.FC<Readonly<IProps>> = ({
  context,
}) => {
  return (
    <div>
      <h1>Hi, {context.name}!</h1>

      <p>Lets confirm your email.</p>

      <a
        href={
          context.frontUrl + "/auth/verify-email?token=" + context.actionToken
        }
      >
        Confirm Email
      </a>

      <p>or copy the link and paste it into your browser.</p>

      <a
        href={
          context.frontUrl + "/auth/verify-email?token=" + context.actionToken
        }
        target="_blank"
        style={{
          color: "#A981DC",
        }}
      >
        {context.frontUrl + "/auth/verify-email?token=" + context.actionToken}
      </a>
    </div>
  );
};
