import type { AtlasData, Entity, Relationship } from './model'
import institutions from './data/institutions.json'
import vehicles from './data/vehicles.json'
import aliases from './data/aliases.json'
import relationships from './data/relationships.json'
import sources from './data/sources.json'
import geographies from './data/geographies.json'
import sectors from './data/sectors.json'
import projects from './data/projects.json'
import transactions from './data/transactions.json'
import entityScope from './data/entity-scope.json'
import relationshipScope from './data/relationship-scope.json'
import scopeSources from './data/scope-sources.json'
import { validateAtlas } from './validation'

const entityAssessments = entityScope as Readonly<Record<string, Pick<Entity, 'scope' | 'themes' | 'roles'>>>
const relationshipAssessments = relationshipScope as Readonly<Record<string, Pick<Relationship, 'themes' | 'scopeRationale' | 'scopeEvidenceIds' | 'participantRoles'>>>

export interface AtlasRepository {
  load(): Promise<AtlasData>
}

export const localRepository: AtlasRepository = {
  async load() {
    const data = {
      institutions: institutions.map(row => ({ ...row, ...entityAssessments[row.id] })),
      vehicles: vehicles.map(row => ({ ...row, ...entityAssessments[row.id] })),
      relationships: relationships.map(row => ({ ...row, ...relationshipAssessments[row.id] })),
      sources: [...sources, ...scopeSources], aliases, geographies, sectors, projects, transactions,
    } as AtlasData
    const errors = validateAtlas(data)
    const entityIds = new Set([...institutions, ...vehicles].map(row => row.id))
    const relationshipIds = new Set(relationships.map(row => row.id))
    for (const id of Object.keys(entityScope)) if (!entityIds.has(id)) errors.push('Unknown entity assessment ' + id + '.')
    for (const id of Object.keys(relationshipScope)) if (!relationshipIds.has(id)) errors.push('Unknown relationship assessment ' + id + '.')
    if (errors.length) throw new Error('The atlas data failed validation. ' + errors.join(' '))
    return data
  },
}

