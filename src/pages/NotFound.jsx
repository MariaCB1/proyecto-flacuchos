import ErrorPage from './ErrorPage';

function NotFound() {
    return (
        <ErrorPage
            code={404}
            title="Página no encontrada"
            message="La página que buscas no existe o ha sido movida. Revisa la URL o vuelve al inicio."
        />
    );
}

export default NotFound;