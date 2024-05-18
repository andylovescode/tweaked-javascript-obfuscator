import { inject, injectable, } from 'inversify';
import { ServiceIdentifiers } from '../../container/ServiceIdentifiers';

import * as ESTree from 'estree';

import { IOptions } from '../../interfaces/options/IOptions';
import { IRandomGenerator } from '../../interfaces/utils/IRandomGenerator';
import { IVisitor } from '../../interfaces/node-transformers/IVisitor';

import { NodeTransformationStage } from '../../enums/node-transformers/NodeTransformationStage';

import { AbstractNodeTransformer } from '../AbstractNodeTransformer';
import { NodeGuards } from '../../node/NodeGuards';
import { NodeFactory } from '../../node/NodeFactory';
import { NodeType } from '../../enums/node/NodeType';

@injectable()
export class SwitchStatementTransformer extends AbstractNodeTransformer {
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
     * @param {NodeTransformationStage} nodeTransformationStage
     * @returns {IVisitor | null}
     */
    public getVisitor (nodeTransformationStage: NodeTransformationStage): IVisitor | null {
        switch (nodeTransformationStage) {
            case NodeTransformationStage.Converting:
                return {
                    enter: (node: ESTree.Node, parentNode: ESTree.Node | null): ESTree.Node | undefined => {
                        if (NodeGuards.isSwitchStatementNode(node)) {
                            return this.transformNode(node);
                        }
                    }
                };

            default:
                return null;
        }
    }

    /**
     * Replaces:
     *     switch (1) {
	 *         case: 1:
	 * 	           console.log("one!");
	 *             break;
	 * 	   }
     *
     * with:
     *     (({ [1]: (() => { console.log("one!") }) })[1] || () => {})()
     *
     * @param {SwitchStatement} switchStatementNode
     * @param {NodeGuards} parentNode
     * @returns {NodeGuards}
     */
    public transformNode (switchStatementNode: ESTree.SwitchStatement): ESTree.Node {
		// Check if simple
		for (const cas of switchStatementNode.cases) {
			if (cas.consequent[cas.consequent.length - 1]?.type !== NodeType.BreakStatement) {
				return switchStatementNode;
			}

			for (const sub of cas.consequent.keys()) {
				if (sub !== cas.consequent.length - 1) {
					if (cas.consequent[sub].type === NodeType.BreakStatement) {
						return switchStatementNode;
					}
				}
			}
		}

		// Generate the case table (and collect the default)
		let defaultCase = NodeFactory.functionExpressionNode([], NodeFactory.blockStatementNode([]));

		const caseTable = NodeFactory.objectExpressionNode([]);

		for (const cas of switchStatementNode.cases) {
			const caseFunction = NodeFactory.functionExpressionNode([], NodeFactory.blockStatementNode(cas.consequent.slice(0, -2)));

			if (!cas.test) {
				defaultCase = caseFunction;
			} else {
				caseTable.properties.push(
					NodeFactory.propertyNode(cas.test, caseFunction)
				);
			}
		}

		// Get the statement finder
		const statementFinder = NodeFactory.logicalExpressionNode(
			'||',
			NodeFactory.memberExpressionNode(
				NodeFactory.logicalExpressionNode(
					'||',
					NodeFactory.literalNode(null, 'null'),
					caseTable
				), // FIXME: This is awful, but i cant find another way to wrap this in parenthesis
				switchStatementNode.discriminant,
				true
			),
			defaultCase
		);

		// Call it!
		return NodeFactory.callExpressionNode(statementFinder);
    }
}
