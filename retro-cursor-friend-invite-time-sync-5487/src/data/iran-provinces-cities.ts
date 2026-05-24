import provinces from 'iran-cities/json/province.json'
import cities from 'iran-cities/json/city.json'

export interface Province {
  id: string
  name: string
}

export interface City {
  id: string
  province_id: string
  county_id: string
  name: string
}

export const allProvinces: Province[] = provinces as Province[]
export const allCities: City[] = cities as City[]

export function getCitiesByProvinceId(provinceId: string): City[] {
  return allCities.filter((city) => city.province_id === provinceId)
}

export function getProvinceById(id: string): Province | undefined {
  return allProvinces.find((p) => p.id === id)
}

export function getCityById(id: string): City | undefined {
  return allCities.find((c) => c.id === id)
}