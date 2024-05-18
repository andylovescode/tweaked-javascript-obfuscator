import { inject, injectable } from 'inversify';
import { ServiceIdentifiers } from '../../container/ServiceIdentifiers';

import { TNodeWithLexicalScope } from '../../types/node/TNodeWithLexicalScope';

import { IOptions } from '../../interfaces/options/IOptions';
import { IRandomGenerator } from '../../interfaces/utils/IRandomGenerator';

import { AbstractIdentifierNamesGenerator } from './AbstractIdentifierNamesGenerator';

@injectable()
export class IncrementalIdentifierNamesGenerator extends AbstractIdentifierNamesGenerator {
	private iterator = 0;
	
	/**
     * @param {IRandomGenerator} randomGenerator
     * @param {IOptions} options
     */
    public constructor (
        @inject(ServiceIdentifiers.IRandomGenerator) randomGenerator: IRandomGenerator,
        @inject(ServiceIdentifiers.IOptions) options: IOptions
    ) {
        super(randomGenerator, options);
    }

    /**
     * @param {number} nameLength
     * @returns {string}
     */
    public generateNext (nameLength?: number): string {
		const identifierName = `x${this.iterator}`;

		this.iterator++;

        return identifierName;
    }

    /**
     * @param {number} nameLength
     * @returns {string}
     */
    public generateForGlobalScope (nameLength?: number): string {
        const identifierName: string = this.generateNext(nameLength);

        return `${this.options.identifiersPrefix}${identifierName}`.replace('__', '_');
    }

    /**
     * @param {TNodeWithLexicalScope} lexicalScopeNode
     * @param {number} nameLength
     * @returns {string}
     */
    public generateForLexicalScope (lexicalScopeNode: TNodeWithLexicalScope, nameLength?: number): string {
        return this.generateNext(nameLength);
    }

    /**
     * @param {string} label
     * @param {number} nameLength
     * @returns {string}
     */
    public generateForLabel (label: string, nameLength?: number): string {
        return this.generateNext(nameLength);
    }
}
