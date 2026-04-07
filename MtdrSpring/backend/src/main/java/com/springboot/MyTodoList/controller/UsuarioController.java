/*
package com.springboot.MyTodoList.controller;
import com.springboot.MyTodoList.model.Usuario;
import com.springboot.MyTodoList.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class UsuarioController {
    @Autowired
    private UsuarioService UsuarioService;

    //@CrossOrigin
    @GetMapping(value = "/Usuarios")
    public List<Usuario> getAllUsuarios(){
        return UsuarioService.findAll();
    }

    //@CrossOrigin
    @GetMapping(value = "/Usuarios/{id}")
    public ResponseEntity<Usuario> getUsuarioById(@PathVariable int id){
        try{
            ResponseEntity<Usuario> responseEntity = UsuarioService.getUsuarioById(id);
            return new ResponseEntity<Usuario>(responseEntity.getBody(), HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    //@CrossOrigin
    @PostMapping(value = "/addUsuario")
    public ResponseEntity<Usuario> addUsuario(@RequestBody Usuario newUsuario) throws Exception{
        Usuario dbUsuario = UsuarioService.addUsuario(newUsuario);
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("location",""+dbUsuario.getID());
        responseHeaders.set("Access-Control-Expose-Headers","location");
        //URI location = URI.create(""+td.getID())

        return ResponseEntity.ok()
                .headers(responseHeaders).build();
    }
    //@CrossOrigin
    @PutMapping(value = "updateUsuario/{id}")
    public ResponseEntity<Usuario> updateUsuario(@RequestBody Usuario Usuario, @PathVariable int id){
        try{
            Usuario dbUsuario = UsuarioService.updateUsuario(id, Usuario);
            
            return new ResponseEntity<>(dbUsuario,HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }
    //@CrossOrigin
    @DeleteMapping(value = "deleteUsuario/{id}")
    public ResponseEntity<Boolean> deleteUsuario(@PathVariable("id") int id){
        Boolean flag = false;
        try{
            flag = UsuarioService.deleteUsuario(id);
            return new ResponseEntity<>(flag, HttpStatus.OK);
        }catch (Exception e){
            return new ResponseEntity<>(flag,HttpStatus.NOT_FOUND);
        }
    }


    @GetMapping(value = "/unitTestAdd")
    public Usuario test(){
        return UsuarioService.test();
    }


}
*/
