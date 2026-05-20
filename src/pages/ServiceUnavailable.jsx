import ErrorPage from './ErrorPage';

function ServiceUnavailable() {
    return (
        <ErrorPage
            code={503}
            title="Servicio no disponible"
            message="Actualmente estamos realizando tareas de mantenimiento. Vuelve más tarde."
        />
    );
}

export default ServiceUnavailable;