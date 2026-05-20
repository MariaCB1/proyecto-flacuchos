import ErrorPage from './ErrorPage';

function ServerError() {
    return (
        <ErrorPage
            code={500}
            title="Error del servidor"
            message="Algo salió mal en nuestro sistema. Nuestro equipo ya está trabajando para solucionarlo."
        />
    );
}

export default ServerError;