# Definitions

- `Remove(Func)`: replace the function declaration by a stub function.
- `Remove(ModuleExport)`: remove the export declaration.
- `Remove(Import)`: remove the import declaration.
- `Remove(Globa)`: remove the global declaration.
- `CountReference(Identifier)`: count how many times the Identifier has been referenced into the program (include its own declaration).

# DCE

- Unused exported func:
  - `Remove(ModuleExport)`
  - `Remove(Func)`
    - Collect Identifiers in its body
        - For CallInstruction
          - For each if `CountReference(Identifier) < 2` and not exported
            - If Import (not implemented)
              - `Remove(Import)`
            - If Func
              - `Remove(Func)`
        - For Instructions `get_global` and `set_global` (not implemented)
          - For each if `CountReference(Identifier) < 2` and not exported
            - `Remove(Global)`
