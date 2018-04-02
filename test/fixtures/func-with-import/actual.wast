(module
  (import "env" "a" (func $a))
  (func (export "test")
    (call $a)
  )
)
