import { AppProps } from "next/dist/shared/lib/router/router";
import { ReactNode } from "react";
import "../styles/app.css";
// import "react-datepicker/dist/react-datepicker.css";
import { AuthProvider } from "lib/hooks/useAuth";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import initFirebase from "lib/initFirebase";

function MyApp({ Component, pageProps }: AppProps): ReactNode {
    const firebaseApp = initFirebase();

    return (
        <AuthProvider firebaseApp={firebaseApp}>
            <Component {...pageProps} />
        </AuthProvider>
    );
}

export default MyApp;
