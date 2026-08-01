const RENIEC_API_URL = process.env.EXPO_PUBLIC_RENIEC_API_URL || '';
const RENIEC_API_TOKEN = process.env.EXPO_PUBLIC_RENIEC_API_TOKEN || '';

export interface ReniecResponse {
  success: boolean;
  data?: {
    numero: string;
    nombre_completo: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    codigo_verificacion: string;
  };
  message?: string;
}

export interface ReniecValidationResult {
  isValid: boolean;
  nombresMatch: boolean;
  apellidosMatch: boolean;
  reniecData?: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nombreCompleto: string;
  };
  errorMessage?: string;
}

const normalizeText = (text: string | undefined | null): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const namesMatch = (input: string | undefined | null, reniec: string | undefined | null): boolean => {
  if (!input || !reniec) return false;

  const normalizedInput = normalizeText(input);
  const normalizedReniec = normalizeText(reniec);

  if (normalizedInput === normalizedReniec) return true;

  const inputParts = normalizedInput.split(' ');
  const reniecParts = normalizedReniec.split(' ');

  for (const inputPart of inputParts) {
    for (const reniecPart of reniecParts) {
      if (inputPart === reniecPart && inputPart.length >= 3) {
        return true;
      }
    }
  }

  return false;
};

export const consultarDNI = async (dni: string): Promise<ReniecResponse> => {
  try {
    const response = await fetch(`${RENIEC_API_URL}?numero=${dni}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${RENIEC_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 401) {
        return {
          success: false,
          message: 'Token de API inválido o expirado.'
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          message: 'DNI no encontrado en RENIEC',
        };
      }

      return {
        success: false,
        message: `Error del servidor: ${response.status}`,
      };
    }

    const data = await response.json();
    let normalizedData = data;

    if (data.data && typeof data.data === 'object') {
      normalizedData = data.data;
    }

    const numero = normalizedData.document_number || normalizedData.numero || normalizedData.dni || normalizedData.DNI || '';
    const nombres = normalizedData.first_name || normalizedData.nombres || normalizedData.name || normalizedData.primer_nombre || '';
    const apellidoPaterno = normalizedData.first_last_name || normalizedData.apellido_paterno || normalizedData.apellidoPaterno || normalizedData.primer_apellido || '';
    const apellidoMaterno = normalizedData.second_last_name || normalizedData.apellido_materno || normalizedData.apellidoMaterno || normalizedData.segundo_apellido || '';
    const nombreCompleto = normalizedData.full_name || normalizedData.nombre_completo || normalizedData.nombreCompleto || `${nombres} ${apellidoPaterno} ${apellidoMaterno}`;

    return {
      success: true,
      data: {
        numero,
        nombre_completo: nombreCompleto,
        nombres,
        apellido_paterno: apellidoPaterno,
        apellido_materno: apellidoMaterno,
        codigo_verificacion: normalizedData.codigo_verificacion || normalizedData.codigoVerificacion || '',
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Error de conexión con RENIEC',
    };
  }
};

export const validarDatosConRENIEC = async (
  dni: string,
  nombres: string,
  apellidos: string
): Promise<ReniecValidationResult> => {
  if (!nombres || !apellidos || !dni) {
    return {
      isValid: false,
      nombresMatch: false,
      apellidosMatch: false,
      errorMessage: 'Datos incompletos. Ingresa DNI, nombres y apellidos.',
    };
  }

  const reniecResponse = await consultarDNI(dni);

  if (!reniecResponse.success || !reniecResponse.data) {
    return {
      isValid: false,
      nombresMatch: false,
      apellidosMatch: false,
      errorMessage: reniecResponse.message || 'No se pudo consultar RENIEC',
    };
  }

  const { data } = reniecResponse;

  if (!data.nombres || !data.apellido_paterno || !data.apellido_materno) {
    return {
      isValid: false,
      nombresMatch: false,
      apellidosMatch: false,
      errorMessage: 'Datos incompletos en la respuesta de RENIEC',
    };
  }

  const inputNombres = normalizeText(nombres);
  const reniecNombres = normalizeText(data.nombres);
  const inputNombresParts = inputNombres.split(' ').filter(p => p.length >= 3);
  const reniecNombresParts = reniecNombres.split(' ').filter(p => p.length >= 3);

  const nombresCoinciden =
    inputNombres === reniecNombres ||
    inputNombresParts.some(inp => reniecNombresParts.some(ren => inp === ren)) ||
    reniecNombres.includes(inputNombres) ||
    inputNombres.includes(reniecNombres);

  const inputApellidos = normalizeText(apellidos);
  const apellidoPaterno = normalizeText(data.apellido_paterno);
  const apellidoMaterno = normalizeText(data.apellido_materno);
  const reniecApellidoCompleto = `${apellidoPaterno} ${apellidoMaterno}`;


  const inputApellidosParts = inputApellidos.split(' ').filter(p => p.length >= 3);


  const apellidosCoinciden =
    inputApellidos === reniecApellidoCompleto ||
    inputApellidos === `${apellidoMaterno} ${apellidoPaterno}` ||
    (

      inputApellidosParts.length >= 2 &&
      inputApellidosParts.some(part => part === apellidoPaterno) &&
      inputApellidosParts.some(part => part === apellidoMaterno)
    );

  const isValid = nombresCoinciden && apellidosCoinciden;

  return {
    isValid,
    nombresMatch: nombresCoinciden,
    apellidosMatch: apellidosCoinciden,
    reniecData: {
      nombres: data.nombres,
      apellidoPaterno: data.apellido_paterno,
      apellidoMaterno: data.apellido_materno,
      nombreCompleto: data.nombre_completo,
    },
    errorMessage: isValid
      ? undefined
      : 'Los datos ingresados no coinciden con RENIEC',
  };
};

export const reniecService = {
  consultarDNI,
  validarDatosConRENIEC,
};
