(module
  (func $a (export "test")
    (nop)
  )

  (func
    (call $a)
  )
)
