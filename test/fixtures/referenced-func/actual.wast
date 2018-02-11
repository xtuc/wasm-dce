(module
  (func $a (export "test") (param i32)
    (nop)
  )

  (func
    (call $a)
  )
)
