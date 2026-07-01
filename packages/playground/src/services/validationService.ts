/**
 * Validation and rule checking service
 */

import type { LintFinding, DesignSystem } from '@google/design-core';

export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  check: (designSystem: DesignSystem) => LintFinding[];
}

class ValidationService {
  private rules: Map<string, ValidationRule> = new Map();
  private activeRules: Set<string> = new Set();

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // Color validation rules
    this.registerRule({
      id: 'missing-primary',
      name: 'Missing Primary Color',
      description: 'Design system should have a primary color defined',
      check: (ds: DesignSystem) => {
        const findings: LintFinding[] = [];
        if (!ds.colors?.primary) {
          findings.push({
            level: 'error',
            rule: 'missing-primary',
            message: 'Primary color is not defined',
          });
        }
        return findings;
      },
    });

    // Typography validation rules
    this.registerRule({
      id: 'missing-base-typography',
      name: 'Missing Base Typography',
      description: 'Design system should have base typography scales defined',
      check: (ds: DesignSystem) => {
        const findings: LintFinding[] = [];
        if (!ds.typography || Object.keys(ds.typography).length === 0) {
          findings.push({
            level: 'warning',
            rule: 'missing-base-typography',
            message: 'No typography tokens defined',
          });
        }
        return findings;
      },
    });

    // Component validation rules
    this.registerRule({
      id: 'orphaned-tokens',
      name: 'Orphaned Tokens',
      description: 'Check for tokens that are not used in any component',
      check: () => {
        // Implementation would check component references
        return [];
      },
    });

    // Spacing validation rules
    this.registerRule({
      id: 'spacing-scale-consistency',
      name: 'Spacing Scale Consistency',
      description: 'Check if spacing values follow a consistent scale',
      check: (ds: DesignSystem) => {
        const findings: LintFinding[] = [];
        if (!ds.spacing || Object.keys(ds.spacing).length === 0) {
          findings.push({
            level: 'info',
            rule: 'spacing-scale-consistency',
            message: 'Consider defining a spacing scale',
          });
        }
        return findings;
      },
    });

    // Activate all by default
    this.activeRules = new Set(this.rules.keys());
  }

  registerRule(rule: ValidationRule): void {
    this.rules.set(rule.id, rule);
  }

  activateRule(ruleId: string): void {
    if (this.rules.has(ruleId)) {
      this.activeRules.add(ruleId);
    }
  }

  deactivateRule(ruleId: string): void {
    this.activeRules.delete(ruleId);
  }

  toggleRule(ruleId: string): void {
    if (this.activeRules.has(ruleId)) {
      this.deactivateRule(ruleId);
    } else {
      this.activateRule(ruleId);
    }
  }

  validate(designSystem: DesignSystem): LintFinding[] {
    const findings: LintFinding[] = [];

    for (const ruleId of this.activeRules) {
      const rule = this.rules.get(ruleId);
      if (rule) {
        findings.push(...rule.check(designSystem));
      }
    }

    return findings.sort((a, b) => {
      const levelOrder = { error: 0, warning: 1, info: 2 };
      return levelOrder[a.level] - levelOrder[b.level];
    });
  }

  getRules(): ValidationRule[] {
    return Array.from(this.rules.values());
  }

  getActiveRules(): ValidationRule[] {
    return Array.from(this.activeRules)
      .map((id) => this.rules.get(id))
      .filter((rule): rule is ValidationRule => Boolean(rule));
  }

  isRuleActive(ruleId: string): boolean {
    return this.activeRules.has(ruleId);
  }
}

export const validationService = new ValidationService();
