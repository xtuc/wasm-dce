(module
  (func $bar
    (nop)
  )
  (func $foo
    (nop)
  )
  (func (export "test")
    (call $foo)
    (call $bar)
  )
)
