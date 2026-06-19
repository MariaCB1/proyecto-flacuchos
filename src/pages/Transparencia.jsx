import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { transparenciaApi } from '../api/api';
import PageHeader from '../components/PageHeader';
import styles from './Transparencia.module.css';

const tabsConfig = [
    { id: 'cif', label: 'CIF', icon: 'badge' },
    { id: 'estatutos', label: 'Estatutos', icon: 'description' },
    { id: 'memoria', label: 'Memoria Anual', icon: 'assessment' },
    { id: 'gastos', label: 'Gastos', icon: 'account_balance_wallet' },
    { id: 'donacion', label: 'Donaciones', icon: 'receipt_long' }
];

function Transparencia() {
    const { user } = useAuth();
    const isAdmin = user?.rol === 'admin';
    const [activeTab, setActiveTab] = useState('cif');
    const [documentos, setDocumentos] = useState({});
    const [loading, setLoading] = useState(true);
    const [editModal, setEditModal] = useState(null);
    const [saving, setSaving] = useState(false);

    const [justificantes, setJustificantes] = useState([]);
    const [añosDisponibles, setAñosDisponibles] = useState([]);
    const [añoSeleccionado, setAñoSeleccionado] = useState(null);
    const [loadingJustificantes, setLoadingJustificantes] = useState(false);
    const [modalJustificante, setModalJustificante] = useState(null);
    const [modalNuevoAño, setModalNuevoAño] = useState(false);
    const [añoParaModalNuevo, setAñoParaModalNuevo] = useState(null);
    const [errorNuevoAño, setErrorNuevoAño] = useState('');

    const fetchDocumentos = useCallback(async () => {
        try {
            setLoading(true);
            const data = await transparenciaApi.getDocumentos();
            const docsMap = {};
            data.forEach(doc => {
                docsMap[doc.tipo] = doc;
            });
            setDocumentos(docsMap);
        } catch (err) {
            console.error('Error fetching documentos:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchJustificantes = useCallback(async () => {
        try {
            setLoadingJustificantes(true);
            const [data, años] = await Promise.all([
                transparenciaApi.getJustificantes(),
                transparenciaApi.getAñosJustificantes()
            ]);
            setJustificantes(data);
            setAñosDisponibles(años);
            if (años.length > 0) {
                if (!añoSeleccionado) {
                    setAñoSeleccionado(años[0]);
                } else if (!años.includes(añoSeleccionado)) {
                    setAñoSeleccionado(años[0]);
                }
            }
        } catch (err) {
            console.error('Error fetching justificantes:', err);
        } finally {
            setLoadingJustificantes(false);
        }
    }, [añoSeleccionado]);

    useEffect(() => {
        fetchDocumentos();
    }, [fetchDocumentos]);

    useEffect(() => {
        if (activeTab === 'gastos') {
            fetchJustificantes();
        }
    }, [activeTab, fetchJustificantes]);

    const handleEditClick = (doc) => {
        const botones = doc.botones_json || [];
        setEditModal({
            tipo: doc.tipo,
            titulo: doc.titulo || '',
            contenido: doc.contenido || '',
            archivo_url: doc.archivo_url || '',
            botones: Array.isArray(botones) ? botones : []
        });
    };

    const handleAddBoton = () => {
        setEditModal(prev => ({
            ...prev,
            botones: [...prev.botones, { label: '', url: '' }]
        }));
    };

    const handleRemoveBoton = (index) => {
        setEditModal(prev => ({
            ...prev,
            botones: prev.botones.filter((_, i) => i !== index)
        }));
    };

    const handleBotonChange = (index, field, value) => {
        setEditModal(prev => ({
            ...prev,
            botones: prev.botones.map((b, i) => i === index ? { ...b, [field]: value } : b)
        }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setSaving(true);
                const result = await transparenciaApi.uploadFile(file);
                setEditModal(prev => ({ ...prev, archivo_url: result.url }));
            } catch (err) {
                alert('Error al subir archivo: ' + err.message);
            } finally {
                setSaving(false);
            }
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await transparenciaApi.updateDocumento(editModal.tipo, {
                titulo: editModal.titulo,
                contenido: editModal.contenido,
                archivo_url: editModal.archivo_url,
                botones_json: editModal.botones
            });
            setEditModal(null);
            fetchDocumentos();
        } catch (err) {
            console.error('Error saving:', err);
            alert('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveJustificante = async () => {
        try {
            setSaving(true);
            const añoDelJustificante = modalJustificante.año;
            if (modalJustificante.id) {
                await transparenciaApi.updateJustificante(modalJustificante.id, modalJustificante);
            } else {
                await transparenciaApi.createJustificante(modalJustificante);
            }
            setModalJustificante(null);
            await fetchJustificantes();
            setAñoSeleccionado(añoDelJustificante);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteJustificante = async (id) => {
        if (confirm('¿Eliminar este justificante?')) {
            try {
                await transparenciaApi.deleteJustificante(id);
                fetchJustificantes();
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const currentYear = new Date().getFullYear();

    const handleOpenBoton = (boton) => {
        if (boton.url.startsWith('mailto:')) {
            window.location.href = boton.url;
        } else if (boton.url) {
            window.open(boton.url, '_blank');
        }
    };

    if (loading) {
        return (
            <>
                <PageHeader title="Transparencia" subtitle="Somos una asociación transparente y comprometida" variant="transparency" />
                <section className={styles.transparency}>
                    <div className="container">
                        <div className={styles.loading}>Cargando...</div>
                    </div>
                </section>
            </>
        );
    }

    const docActual = documentos[activeTab];
    const botones = docActual?.botones_json ? (typeof docActual.botones_json === 'string' ? JSON.parse(docActual.botones_json) : docActual.botones_json) : [];

    return (
        <>
            <PageHeader title="Transparencia" subtitle="Somos una asociación transparente y comprometida" variant="transparency" />

            <section className={styles.transparency}>
                <div className="container">
                    <div className={styles.tabs}>
                        {tabsConfig.map(tab => (
                            <button
                                key={tab.id}
                                className={`${styles.tabBtn} ${activeTab === tab.id ? styles.activeTab : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <span className={styles.tabIcon}>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className={styles.tabContent}>
                        {activeTab === 'gastos' ? (
                            <div className={styles.gastosSection}>
                                <div className={styles.gastosHeader}>
                                    <h2>{docActual?.titulo || 'Justificación de Gastos'}</h2>
                                    <p>{docActual?.contenido}</p>
                                </div>

                                <div className={styles.gastosActions}>
                                    <select
                                        className={styles.yearSelect}
                                        value={typeof añoSeleccionado === 'number' ? añoSeleccionado : ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === 'nuevo') {
                                                const añosParaCrear = Array.from({ length: currentYear - 2019 + 1 }, (_, i) => 2019 + i).filter(año => !añosDisponibles.includes(año));
                                                if (añosParaCrear.length > 0) {
                                                    setAñoParaModalNuevo(añosParaCrear[0]);
                                                }
                                                setModalNuevoAño(true);
                                            } else {
                                                setAñoSeleccionado(parseInt(val));
                                            }
                                        }}
                                    >
                                        <option value="" disabled>Seleccionar año</option>
                                        {añosDisponibles.map(año => (
                                            <option key={año} value={año}>{año}</option>
                                        ))}
                                        {isAdmin && <option value="nuevo">+ Añadir nuevo año</option>}
                                    </select>
                                    {isAdmin && añoSeleccionado && (
                                        <button className="btn btn-primary" onClick={() => setModalJustificante({ año: añoSeleccionado, concepto: '', importe: '' })}>
                                            + Añadir justificante
                                        </button>
                                    )}
                                </div>

                                {loadingJustificantes ? (
                                    <div className={styles.loading}>Cargando...</div>
                                ) : (
                                    <>
                                        {añosDisponibles.length === 0 ? (
                                            <div className={styles.noData}>
                                                <p>No hay justificantes registrados.</p>
                                                {isAdmin && <button className="btn btn-primary" onClick={() => setModalJustificante({ año: currentYear, concepto: '', importe: '' })}>+ Añadir primer justificante</button>}
                                            </div>
                                        ) : (
                                            <>
                                                {añoSeleccionado && (
                                                    <h3 className={styles.yearHeading}>Justificantes de {añoSeleccionado}</h3>
                                                )}
                                                {añoSeleccionado && (
                                                    <div className={styles.justificantesTable}>
                                                        <table>
                                                            <thead>
                                                                <tr>
                                                                    <th>Concepto</th>
                                                                    <th>Importe (IVA incl.)</th>
                                                                    <th>Archivo</th>
                                                                    {isAdmin && <th>Acciones</th>}
                                                                </tr>
                                                            </thead>
<tbody>
                                                                {(() => {
                                                                    const justificantesDelAño = justificantes.filter(j => j.año === añoSeleccionado);
                                                                    if (justificantesDelAño.length === 0) {
                                                                        return (
                                                                            <tr>
                                                                                <td colSpan={isAdmin ? 4 : 3} style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                                                                                    No hay justificantes para este año.
                                                                                    {isAdmin && <button className="btn btn-primary" style={{ marginLeft: '15px' }} onClick={() => setModalJustificante({ año: añoSeleccionado, concepto: '', importe: '' })}>+ Añadir</button>}
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    }
                                                                    return justificantesDelAño.map(j => (
                                                                        <tr key={j.id}>
                                                                            <td>{j.concepto}</td>
                                                                            <td className={styles.importeCell}>{parseFloat(j.importe).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                                                                            <td>
                                                                                {j.archivo_url ? (
                                                                                    <a href={j.archivo_url} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                                                                                        <span className="material-symbols-outlined">attach_file</span> Ver
                                                                                    </a>
                                                                                ) : <span className={styles.noFile}>-</span>}
                                                                            </td>
                                                                            {isAdmin && (
                                                                                <td className={styles.actionsCell}>
                                                                                    <button className={styles.actionBtn} onClick={() => setModalJustificante({ id: j.id, año: j.año, concepto: j.concepto, importe: j.importe, archivo_url: j.archivo_url })}>
                                                                                        <span className="material-symbols-outlined">edit</span>
                                                                                    </button>
                                                                                    <button className={styles.actionBtnDelete} onClick={() => handleDeleteJustificante(j.id)}>
                                                                                        <span className="material-symbols-outlined">delete</span>
                                                                                    </button>
                                                                                </td>
                                                                            )}
                                                                        </tr>
                                                                    ));
                                                                })()}
                                                            </tbody>
                                                            <tfoot>
                                                                <tr>
                                                                    <td><strong>TOTAL</strong></td>
                                                                    <td className={styles.importeCell}>
                                                                        <strong>
                                                                            {justificantes.filter(j => j.año === añoSeleccionado).reduce((sum, j) => sum + parseFloat(j.importe || 0), 0).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                                                        </strong>
                                                                    </td>
                                                                    <td colSpan={isAdmin ? 2 : 1}></td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className={styles.docSection}>
                                <div className={styles.docHeader}>
                                    <h2>{docActual?.titulo || ''}</h2>
                                    {isAdmin && (
                                        <button className={styles.editBtn} onClick={() => handleEditClick(docActual)}>
                                            <span className="material-symbols-outlined">edit</span> Editar
                                        </button>
                                    )}
                                </div>
                                <div className={styles.docContent}>
                                    <p>{docActual?.contenido}</p>
                                </div>
                                {botones.length > 0 && (
                                    <div className={styles.botonesContainer}>
                                        {botones.map((boton, idx) => (
                                            <button
                                                key={idx}
                                                className={styles.botonBtn}
                                                onClick={() => handleOpenBoton(boton)}
                                                disabled={!boton.url}
                                            >
                                                {boton.label || 'Descargar'}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {editModal && (
                <div className={styles.modalOverlay} onClick={() => !saving && setEditModal(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Editar: {editModal.tipo.toUpperCase()}</h3>
                            <button className={styles.closeBtn} onClick={() => setEditModal(null)} disabled={saving}>×</button>
                        </div>
                        <div className={styles.modalForm}>
                            <div className={styles.field}>
                                <label>Título</label>
                                <input type="text" value={editModal.titulo} onChange={e => setEditModal(prev => ({ ...prev, titulo: e.target.value }))} />
                            </div>
                            <div className={styles.field}>
                                <label>Contenido</label>
                                <textarea value={editModal.contenido} onChange={e => setEditModal(prev => ({ ...prev, contenido: e.target.value }))} rows={8} />
                            </div>
                            <div className={styles.field}>
                                <label>Botones</label>
                                {editModal.botones.map((b, idx) => (
                                    <div key={idx} className={styles.botonEdit}>
                                        <input type="text" placeholder="Label" value={b.label} onChange={e => handleBotonChange(idx, 'label', e.target.value)} />
                                        <input type="text" placeholder="URL (mailto:...)" value={b.url} onChange={e => handleBotonChange(idx, 'url', e.target.value)} />
                                        <button type="button" onClick={() => handleRemoveBoton(idx)} className={styles.removeBotonBtn}>
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                ))}
                                <button type="button" className={styles.addBotonBtn} onClick={handleAddBoton}>+ Añadir botón</button>
                            </div>
                            <div className={styles.field}>
                                <label>Archivo</label>
                                {editModal.archivo_url ? (
                                    <div className={styles.currentFile}>
                                        <a href={editModal.archivo_url} target="_blank" rel="noopener noreferrer">📎 Archivo actual</a>
                                    </div>
                                ) : <p className={styles.noFile}>Sin archivo</p>}
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png,.gif,.webp" onChange={handleFileChange} className={styles.fileInput} />
                            </div>
                            <div className={styles.modalActions}>
                                <button className="btn btn-secondary" onClick={() => setEditModal(null)} disabled={saving}>Cancelar</button>
                                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalJustificante && (
                <div className={styles.modalOverlay} onClick={() => !saving && setModalJustificante(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{modalJustificante.id ? 'Editar' : 'Nuevo'} Justificante</h3>
                            <button className={styles.closeBtn} onClick={() => setModalJustificante(null)} disabled={saving}>×</button>
                        </div>
                        <div className={styles.modalForm}>
                            <div className={styles.field}>
                                <label>Año</label>
                                <select value={modalJustificante.año} onChange={e => setModalJustificante(prev => ({ ...prev, año: parseInt(e.target.value) }))}>
                                    {(añosDisponibles.includes(modalJustificante.año) ? añosDisponibles : [modalJustificante.año, ...añosDisponibles]).map(año => (
                                        <option key={año} value={año}>{año}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label>Concepto</label>
                                <input type="text" value={modalJustificante.concepto} onChange={e => setModalJustificante(prev => ({ ...prev, concepto: e.target.value }))} placeholder="Ej: Veterinario, Comida, Mantenimiento..." />
                            </div>
                            <div className={styles.field}>
                                <label>Importe (€)</label>
                                <input type="number" step="0.01" value={modalJustificante.importe} onChange={e => setModalJustificante(prev => ({ ...prev, importe: e.target.value }))} placeholder="0.00" />
                            </div>
                            <div className={styles.field}>
                                <label>Archivo (opcional)</label>
                                {modalJustificante.archivo_url ? (
                                    <div className={styles.currentFile}>
                                        <a href={modalJustificante.archivo_url} target="_blank" rel="noopener noreferrer">📎 Archivo actual</a>
                                    </div>
                                ) : <p className={styles.noFile}>Sin archivo</p>}
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                        try {
                                            setSaving(true);
                                            const result = await transparenciaApi.uploadFile(file);
                                            setModalJustificante(prev => ({ ...prev, archivo_url: result.url }));
                                        } catch (err) {
                                            alert(err.message);
                                        } finally {
                                            setSaving(false);
                                        }
                                    }
                                }} className={styles.fileInput} />
                            </div>
                            <div className={styles.modalActions}>
                                <button className="btn btn-secondary" onClick={() => setModalJustificante(null)} disabled={saving}>Cancelar</button>
                                <button className="btn btn-primary" onClick={handleSaveJustificante} disabled={saving || !modalJustificante.concepto || !modalJustificante.importe}>{saving ? 'Guardando...' : 'Guardar'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {modalNuevoAño && (
                <div className={styles.modalOverlay} onClick={() => { if (!saving) { setModalNuevoAño(false); setErrorNuevoAño(''); } }}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>Crear Nuevo Año</h3>
                            <button className={styles.closeBtn} onClick={() => setModalNuevoAño(false)} disabled={saving}>×</button>
                        </div>
                        <div className={styles.modalForm}>
                            <p className={styles.modalDescription}>Selecciona el año del que quieres añadir justificantes de gastos:</p>
                            <div className={styles.field}>
                                <label>Año</label>
                                {(() => {
                                    const añosDisponiblesParaCrear = Array.from({ length: currentYear - 2019 + 1 }, (_, i) => 2019 + i)
                                        .filter(año => !añosDisponibles.includes(año));
                                    if (añosDisponiblesParaCrear.length === 0) {
                                        return <p className={styles.noFile}>No hay años disponibles para crear. Todos los años entre 2019 y {currentYear} ya existen.</p>;
                                    }
                                    const añoInicial = añosDisponiblesParaCrear[0];
                                    return (
                                        <select
                                            className={styles.yearSelect}
                                            value={añoParaModalNuevo || añoInicial}
                                            onChange={(e) => {
                                                setAñoParaModalNuevo(parseInt(e.target.value));
                                                setErrorNuevoAño('');
                                            }}
                                        >
                                            {añosDisponiblesParaCrear.map(año => (
                                                <option key={año} value={año}>{año}</option>
                                            ))}
                                        </select>
                                    );
                                })()}
                            </div>
                            {errorNuevoAño && (
                                <div className={styles.errorMessage}>{errorNuevoAño}</div>
                            )}
                            <div className={styles.modalActions}>
                                <button className="btn btn-secondary" onClick={() => { setModalNuevoAño(false); setAñoParaModalNuevo(null); }} disabled={saving}>Cancelar</button>
                                <button className="btn btn-secondary" onClick={async () => {
                                    const año = añoParaModalNuevo || currentYear;
                                    if (añosDisponibles.includes(año)) {
                                        setErrorNuevoAño(`El año ${año} ya existe. Selecciona otro año o añádele justificantes desde el panel principal.`);
                                        return;
                                    }
                                    try {
                                        setSaving(true);
                                        await transparenciaApi.createJustificante({
                                            año,
                                            concepto: 'Año iniciado',
                                            importe: 0
                                        });
                                        await fetchJustificantes();
                                        setModalNuevoAño(false);
                                        setAñoParaModalNuevo(null);
                                        setAñoSeleccionado(año);
                                    } catch (err) {
                                        console.error('Error creando año:', err);
                                        setErrorNuevoAño('Error al crear el año');
                                    } finally {
                                        setSaving(false);
                                    }
                                }} disabled={saving}>
                                    Crear solo año
                                </button>
                                <button className="btn btn-primary" onClick={() => {
                                    const año = añoParaModalNuevo || currentYear;
                                    if (añosDisponibles.includes(año)) {
                                        setErrorNuevoAño(`El año ${año} ya existe. Selecciona otro año o añádele justificantes desde el panel principal.`);
                                        return;
                                    }
                                    setModalNuevoAño(false);
                                    setAñoParaModalNuevo(null);
                                    setAñoSeleccionado(año);
                                    setModalJustificante({ año, concepto: '', importe: '' });
                                }} disabled={saving}>
                                    Crear año y añadir justificante
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Transparencia;