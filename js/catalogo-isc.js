/* Catálogo del programa ISC del Tecnológico de Tepic + especialidad Full Stack (2026).
   Fuente de créditos: https://www.tepic.tecnm.mx/ofertaeducativa/licenciatura/ingenieria-en-sistemas-computacionales
   Fuentes de unidades: programas oficiales por asignatura vinculados en el portal,
   excepto SCA-1002, cuyo temario se contrastó con TecNM (4 unidades).
   Las claves se mantienen como aparecen en el documento de competencias previas
   proporcionado por el usuario; clavePortal indica variantes del portal actual.
   La unidad 2 de SCD-1016 es la única que tiene ejercicios implementados.
*/
export const COMPLEMENTARIOS = Object.freeze([
  { nombre: 'Residencia profesional', creditos: 10 },
  { nombre: 'Servicio social', creditos: 10 },
  { nombre: 'Actividades complementarias', creditos: 5 },
]);
export const SEMESTRES = [
  {
    "semestre": 1,
    "materias": [
      {
        "clave": "ACF-0901",
        "nombre": "Cálculo Diferencial",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 5
      },
      {
        "clave": "SCD-1008",
        "nombre": "Fundamentos de Programación",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 5,
        "clavePortal": "SCD-1011 / AED-1285"
      },
      {
        "clave": "ACA-0907",
        "nombre": "Taller de Ética",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 4,
        "clavePortal": "ACA-IS10"
      },
      {
        "clave": "AEF-1041",
        "nombre": "Matemáticas Discretas",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          },
          {
            "numero": 6,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 6
      },
      {
        "clave": "SCH-1024",
        "nombre": "Taller de Administración",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 5
      },
      {
        "clave": "ACC-0906",
        "nombre": "Fundamentos de Investigación",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 4
      }
    ],
    "creditos": 27
  },
  {
    "semestre": 2,
    "materias": [
      {
        "clave": "ACF-0902",
        "nombre": "Cálculo Integral",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 4
      },
      {
        "clave": "SCD-1020",
        "nombre": "Programación Orientada a Objetos",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          },
          {
            "numero": 6,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 6,
        "clavePortal": "AED-1286"
      },
      {
        "clave": "AEC-1008",
        "nombre": "Contabilidad Financiera",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 5
      },
      {
        "clave": "AEC-1058",
        "nombre": "Química",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 4
      },
      {
        "clave": "ACF-0903",
        "nombre": "Álgebra Lineal",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 5
      },
      {
        "clave": "AEF-1052",
        "nombre": "Probabilidad y Estadística",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 5
      }
    ],
    "creditos": 28
  },
  {
    "semestre": 3,
    "materias": [
      {
        "clave": "ACF-0904",
        "nombre": "Cálculo Vectorial",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 5
      },
      {
        "clave": "AED-1026",
        "nombre": "Estructura de Datos",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          },
          {
            "numero": 6,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 6
      },
      {
        "clave": "SCC-1055",
        "nombre": "Cultura Empresarial",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 5,
        "clavePortal": "SCC-1005"
      },
      {
        "clave": "SCC-1013",
        "nombre": "Investigación de Operaciones",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 5
      },
      {
        "clave": "ACD-0908",
        "nombre": "Desarrollo Sustentable",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 5
      },
      {
        "clave": "SCF-1006",
        "nombre": "Física General",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          },
          {
            "numero": 6,
            "disponible": false
          },
          {
            "numero": 7,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 7
      }
    ],
    "creditos": 28
  },
  {
    "semestre": 4,
    "materias": [
      {
        "clave": "ACF-0905",
        "nombre": "Ecuaciones Diferenciales",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 4
      },
      {
        "clave": "SCC-1017",
        "nombre": "Métodos Numéricos",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          },
          {
            "numero": 6,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 6
      },
      {
        "clave": "SCD-1027",
        "nombre": "Tópicos Avanzados de Programación",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 5
      },
      {
        "clave": "AEF-1031",
        "nombre": "Fundamentos de Base de Datos",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          },
          {
            "numero": 6,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 6
      },
      {
        "clave": "SCD-1022",
        "nombre": "Simulación",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 5
      },
      {
        "clave": "SCD-1018",
        "nombre": "Principios eléctricos y aplicaciones digitales",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 4
      }
    ],
    "creditos": 29
  },
  {
    "semestre": 5,
    "materias": [
      {
        "clave": "SCC-1010",
        "nombre": "Graficación",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 5
      },
      {
        "clave": "AEC-1034",
        "nombre": "Fundamentos de Telecomunicaciones",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 5
      },
      {
        "clave": "AEC-1061",
        "nombre": "Sistemas Operativos",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          },
          {
            "numero": 6,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 6
      },
      {
        "clave": "SCA-1025",
        "nombre": "Taller de Base de Datos",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          },
          {
            "numero": 6,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 6
      },
      {
        "clave": "SCC-1007",
        "nombre": "Fundamentos de Ingeniería de Software",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 5
      },
      {
        "clave": "SCD-1003",
        "nombre": "Arquitectura de Computadoras",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 4
      }
    ],
    "creditos": 25
  },
  {
    "semestre": 6,
    "materias": [
      {
        "clave": "SCD-1015",
        "nombre": "Lenguajes y Autómatas I",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          },
          {
            "numero": 6,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 6
      },
      {
        "clave": "AEB-1055",
        "nombre": "Programación Web",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 5
      },
      {
        "clave": "SCD-1021",
        "nombre": "Redes de Computadora",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 5
      },
      {
        "clave": "SCA-1026",
        "nombre": "Taller de Sistemas Operativos",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 4
      },
      {
        "clave": "SCB-1001",
        "nombre": "Administración de Base de Datos",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          },
          {
            "numero": 6,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 6
      },
      {
        "clave": "SCD-1011",
        "nombre": "Ingeniería de Software",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 4,
        "clavePortal": "SCD-1012"
      },
      {
        "clave": "SCC-1014",
        "nombre": "Lenguaje de Interfaz",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 4
      }
    ],
    "creditos": 33
  },
  {
    "semestre": 7,
    "materias": [
      {
        "clave": "SCD-1016",
        "nombre": "Lenguajes y Autómatas II",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": true
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 4
      },
      {
        "clave": "SCD-1004",
        "nombre": "Conmutación y Enrutamientos de Datos",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 4
      },
      {
        "clave": "ACA-0909",
        "nombre": "Taller de Investigación I",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 3
      },
      {
        "clave": "DFD-2601",
        "nombre": "Habilidades Directivas y pensamiento transformador",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 5
      },
      {
        "clave": "DFD-2602",
        "nombre": "Laboratorio de Base de Datos NoSQL",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 5
      },
      {
        "clave": "SCC-1023",
        "nombre": "Sistemas Programables",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          },
          {
            "numero": 6,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 6
      }
    ],
    "creditos": 28
  },
  {
    "semestre": 8,
    "materias": [
      {
        "clave": "SCC-1019",
        "nombre": "Programación Lógica y Funcional",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 4
      },
      {
        "clave": "SCA-1002",
        "nombre": "Administración de Redes",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 4
      },
      {
        "clave": "ACA-0910",
        "nombre": "Taller de Investigación II",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 3
      },
      {
        "clave": "SCG-1009",
        "nombre": "Gestión de Proyectos de Software",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 6,
        "numeroUnidades": 5
      },
      {
        "clave": "DFD-2603",
        "nombre": "Laboratorio de Servicios Web",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 4
      },
      {
        "clave": "DFD-2604",
        "nombre": "Taller de Full Stack",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 5
      }
    ],
    "creditos": 28
  },
  {
    "semestre": 9,
    "materias": [
      {
        "clave": "SCC-1012",
        "nombre": "Inteligencia Artificial",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          }
        ],
        "creditos": 4,
        "numeroUnidades": 4
      },
      {
        "clave": "DFD-2605",
        "nombre": "Desarrollo de Proyectos Full Stack",
        "unidades": [
          {
            "numero": 1,
            "disponible": false
          },
          {
            "numero": 2,
            "disponible": false
          },
          {
            "numero": 3,
            "disponible": false
          },
          {
            "numero": 4,
            "disponible": false
          },
          {
            "numero": 5,
            "disponible": false
          },
          {
            "numero": 6,
            "disponible": false
          }
        ],
        "creditos": 5,
        "numeroUnidades": 6
      }
    ],
    "creditos": 9
  }
];
