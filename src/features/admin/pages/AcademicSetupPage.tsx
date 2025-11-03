import React, { useState, useEffect } from 'react';
import { Settings, MapPin, Building } from 'lucide-react';
import clsx from 'clsx'; // Añadido clsx para manejar clases condicionales

// ==========================================================
// 🎯 Tipos para la Institución (Ajustados al formato del backend si es necesario)
// ==========================================================
interface InstitutionData {
    id: number;
    nombre_legal: string;
    nombre_corto: string;
    codigo_modular: string;
    ruc: string;
    direccion: string;
    departamento: string;
    provincia: string;
    distrito: string;
    telefono: string;
    email: string;
    fundacion_anio: number;
    resolucion_creacion: string;
    nivel_educativo: string;
}

// ==========================================================
// 🎯 Componente de Fila de Configuración (MEJORADO PARA SOLO LECTURA)
// ==========================================================

interface ConfigRowProps {
    label: string;
    value: string | number;
    // Se eliminan placeholder y onChange ya que no se usan en modo solo lectura
    readOnly?: boolean; 
}

// Nota: Hemos simplificado la ConfigRow, ya que solo va a mostrar datos.
const ConfigRow: React.FC<ConfigRowProps> = ({ 
    label, 
    value, 
}) => {
    // Usamos el valor directamente en un div o input de solo lectura
    const displayValue = value || 'N/A';

    return (
        <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-slate-100 last:border-b-0">
            
            {/* Etiqueta */}
            <div className="w-full sm:w-1/3 mb-1 sm:mb-0">
                <label className="text-sm font-medium text-slate-700 block">{label}</label>
            </div>
            
            {/* Campo de Visualización (Responsive) */}
            <div className="flex-1 w-full sm:w-auto sm:mx-4">
                <div
                    className={clsx(
                        "w-full px-3 py-2 rounded-lg text-sm font-medium",
                        "bg-slate-50 border border-slate-200 text-slate-700"
                    )}
                >
                    {displayValue}
                </div>
            </div>
        </div>
    );
};


// ==========================================================
// 🎯 Componente Principal: GeneralSetupPage (SOLO LECTURA)
// ==========================================================
export default function GeneralSetupPage() {
    const [institution, setInstitution] = useState<InstitutionData | null>(null);
    const [loading, setLoading] = useState(true);

    // Mapeo del backend (login) a la interfaz del componente
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapBackendToFrontend = (backendData: any): InstitutionData => ({
        id: backendData.id,
        nombre_legal: backendData.name || 'N/A',
        nombre_corto: backendData.name || 'N/A',
        codigo_modular: backendData.code || 'N/A',
        direccion: backendData.address || 'Sin registrar',
        email: backendData.email || 'Sin registrar',
        telefono: backendData.phone || 'Sin registrar',
        
        // Campos que NO vienen de la respuesta JSON del login (Simulamos o los dejamos vacíos)
        // IDEALMENTE, DEBEN SER CARGADOS DEL BACKEND EN LA RUTA DE LOGIN
        ruc: 'PENDIENTE_RUC', 
        departamento: 'PENDIENTE_DEPARTAMENTO',
        provincia: 'PENDIENTE_PROVINCIA',
        distrito: 'PENDIENTE_DISTRITO',
        fundacion_anio: 0,
        resolucion_creacion: 'PENDIENTE_RESOLUCION',
        nivel_educativo: 'PENDIENTE_NIVEL',
    });


    // 1. Carga de datos desde localStorage (Respuesta del Login)
    useEffect(() => {
        const userDataString = localStorage.getItem("user");
        
        if (userDataString) {
            try {
                const userData = JSON.parse(userDataString);
                
                if (userData.assignedInstitution) {
                    setInstitution(mapBackendToFrontend(userData.assignedInstitution));
                }
            } catch (e) {
                console.error("Error al parsear datos de usuario:", e);
            }
        }
        setLoading(false);
    }, []);

    // Se elimina handleInstitutionChange y handleSave

    if (loading) {
        return (
            <div className="text-center py-10 text-slate-500">
                Cargando configuración institucional...
            </div>
        );
    }

    if (!institution) {
        return (
            <div className="text-center py-10 text-red-600">
                No se pudo cargar la información de la institución asignada. Por favor, inicie sesión nuevamente.
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6"> 
            
            {/* Título Principal */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-3">
                <h1 className="text-3xl font-extrabold text-slate-800 flex items-center mb-3 md:mb-0">
                    <Settings className="inline w-7 h-7 mr-3 text-sky-600" />
                    Configuración General: <span className="text-xl ml-2 font-semibold text-sky-700">{institution.nombre_corto}</span>
                </h1>
                
                {/* 🛑 ELIMINAMOS EL BOTÓN DE GUARDAR */}
            </div>
            
            {/* Navegación Sidebar (Recordatorio) */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-blue-700">
                    Utilice el menú lateral bajo **"Configuración Académica"** para gestionar Periodos, Planes y Facultades.
                </p>
            </div>

            {/* Grid de Secciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Sección 1: Identificación Legal */}
                <section className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 h-full">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center border-b pb-2">
                        <Building className="w-5 h-5 mr-2 text-indigo-500" />
                        Datos de Identificación y Legales
                    </h2>
                    
                    <div className="space-y-2">
                        <ConfigRow label="Nombre Legal Completo" value={institution.nombre_legal} />
                        <ConfigRow label="Nombre Corto / Comercial" value={institution.nombre_corto} />
                        <ConfigRow label="Código Modular" value={institution.codigo_modular} />
                        <ConfigRow label="RUC" value={institution.ruc} />
                        <ConfigRow label="Nivel Educativo Principal" value={institution.nivel_educativo} />
                        <ConfigRow label="Resolución de Creación" value={institution.resolucion_creacion} />
                        <ConfigRow label="Año de Fundación" value={institution.fundacion_anio} />
                    </div>
                </section>

                {/* Sección 2: Contacto y Ubicación */}
                <section className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 h-full">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center border-b pb-2">
                        <MapPin className="w-5 h-5 mr-2 text-green-500" />
                        Contacto y Ubicación
                    </h2>

                    <div className="space-y-2">
                        <ConfigRow label="Dirección Física Completa" value={institution.direccion} />
                        <ConfigRow label="Departamento" value={institution.departamento} />
                        <ConfigRow label="Provincia" value={institution.provincia} />
                        <ConfigRow label="Distrito" value={institution.distrito} />
                        <ConfigRow label="Teléfono de Contacto" value={institution.telefono} />
                        <ConfigRow label="Correo Electrónico Oficial" value={institution.email} />
                    </div>
                </section>
            </div>
            
            {/* 🛑 ELIMINAMOS EL BOTÓN DE GUARDAR INFERIOR */}
            <div className="h-6"></div> 

        </div>
    );
}