import mongoose, { Schema, Document, Model } from 'mongoose'

/**
 * Content model — long-form study material for a concept.
 * One document per concept (linked by `conceptId`).
 *
 * Stored in the `content` MongoDB collection. The schema is intentionally
 * lenient (strict: false) because the source documents are authored by
 * editors in MongoDB and may evolve; we don't want unknown fields stripped
 * silently on read.
 */

export interface IHighLevelView {
  whatItIs?: string
  whyItMatters?: string
  keyMentalMove?: string
}

export interface IFundamental {
  id?: string
  title?: string
  order?: number
  intuition?: string
  formalStatement?: string
  formula?: string
  example?: string
  gateTrap?: string
  reference?: string
}

export interface IKeyword {
  term?: string
  type?: 'compound' | 'singular' | string
  decode?: string
  bridge?: string
  predictsMeaning?: boolean
}

export interface ITerm {
  symbol?: string
  means?: string
}

export interface IFormula {
  formulaId?: string
  name?: string
  latex?: string
  plain?: string
  whenToUse?: string
  terms?: ITerm[]
  trap?: string
  reference?: string
}

export interface IGroup {
  groupId?: string
  groupTitle?: string
  formulas?: IFormula[]
}

export interface IDecisionGuide {
  title?: string
  questions?: string[]
  map?: { condition?: string; use?: string }[]
}

export interface IContent extends Document<string> {
  _id: string
  conceptId: string
  conceptTitle?: string
  reference?: string

  // Long-form shape (legacy)
  highLevelView?: IHighLevelView
  fundamentals?: IFundamental[]
  keywords?: IKeyword[]
  compositionNote?: string
  quickRecall?: string[]
  coverageStatement?: string

  // Formula-sheet shape (new)
  decisionGuide?: IDecisionGuide
  groups?: IGroup[]

  createdAt?: Date
  updatedAt?: Date
}

const HighLevelViewSchema = new Schema<IHighLevelView>(
  {
    whatItIs: { type: String },
    whyItMatters: { type: String },
    keyMentalMove: { type: String },
  },
  { _id: false, strict: false }
)

const FundamentalSchema = new Schema<IFundamental>(
  {
    id: { type: String },
    title: { type: String },
    order: { type: Number },
    intuition: { type: String },
    formalStatement: { type: String },
    formula: { type: String },
    example: { type: String },
    gateTrap: { type: String },
    reference: { type: String },
  },
  { _id: false, strict: false }
)

const KeywordSchema = new Schema<IKeyword>(
  {
    term: { type: String },
    type: { type: String },
    decode: { type: String },
    bridge: { type: String },
    predictsMeaning: { type: Boolean },
  },
  { _id: false, strict: false }
)

const ContentSchema = new Schema<IContent>(
  {
    _id: { type: String },
    conceptId: { type: String, required: true, index: true },
    conceptTitle: { type: String },
    reference: { type: String },
    highLevelView: { type: HighLevelViewSchema },
    fundamentals: { type: [FundamentalSchema], default: [] },
    keywords: { type: [KeywordSchema], default: [] },
    compositionNote: { type: String },
    quickRecall: { type: [String], default: [] },
    coverageStatement: { type: String },
  },
  {
    timestamps: true,
    collection: 'content',
    strict: false, // tolerate extra fields editors may add later
  }
)

const ContentModel: Model<IContent> =
  mongoose.models.Content ??
  mongoose.model<IContent>('Content', ContentSchema)

export default ContentModel
