import * as Sentry from "@sentry/nextjs";
import Error from "next/error";

const CustomErrorComponent = (props) => {
  return <Error statusCode={props.statusCode} />;
};

CustomErrorComponent.getInitialProps = async (contextData) => {
  const { err, res } = contextData;

  if (err) {
    await Sentry.captureUnderscoreErrorException(contextData);
  } else {
    Sentry.captureMessage(
      `_error.js called without error object (statusCode: ${res?.statusCode || "unknown"})`
    );
  }

  return Error.getInitialProps(contextData);
};

export default CustomErrorComponent;
