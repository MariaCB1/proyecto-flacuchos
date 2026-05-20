import ErrorPage from './ErrorPage';

function Forbidden() {
    return (
        <ErrorPage
            code={403}
            title="Acceso denegado"
            message="No tienes permisos para acceder a esta sección. Si crees que debería tener acceso, contacta con nosotros."
        />
    );
}

export default Forbidden;