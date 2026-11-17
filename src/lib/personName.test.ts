import { describe, expect, it } from 'vitest'
import { displayName, firstNameOf, initialsOf } from './personName'

describe('displayName', () => {
  it('usa el nombre de la cuenta cuando lo hay', () => {
    expect(displayName({ name: 'Carmen Rojas', email: 'carmen@finca.example' })).toBe('Carmen Rojas')
  })

  it('cae en la parte anterior a la arroba, no en el correo entero', () => {
    // El registro solo pide correo y contraseña, asi que el nombre puede faltar:
    // la barra lateral se quedaba en blanco y el saludo era un "¡Hola!" pelado.
    expect(displayName({ name: '', email: 'camilo.munoz@finca.example' })).toBe('camilo.munoz')
    expect(displayName({ name: '   ', email: 'ana@finca.example' })).toBe('ana')
  })

  it('no se queda sin nada que decir', () => {
    expect(displayName({})).toBe('Tu cuenta')
  })
})

describe('firstNameOf', () => {
  it('saluda con una sola palabra', () => {
    expect(firstNameOf({ name: 'Ana María Ruiz' })).toBe('Ana')
    expect(firstNameOf({ name: null, email: 'diego@finca.example' })).toBe('diego')
  })
})

describe('initialsOf', () => {
  it('saca dos letras del nombre o del correo', () => {
    expect(initialsOf({ name: 'Carmen Rojas' })).toBe('CR')
    expect(initialsOf({ name: null, email: 'camilo.munoz@finca.example' })).toBe('CM')
    expect(initialsOf({ name: null, email: 'ana@finca.example' })).toBe('A')
  })
})
