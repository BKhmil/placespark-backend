import * as React from "react";

interface IProps {
  context: {
    name: string;
    frontUrl: string;
  };
}

export const LogoutEmail: React.FC<Readonly<IProps>> = ({ context }) => {
  return (
    <div>
      <h1>{context.name}, u were successfully logged out!</h1>

      <p>Sign-in again</p>

      <a href={context.frontUrl + "/auth/sign-in"}>SIGN-IN</a>
    </div>
  );
};