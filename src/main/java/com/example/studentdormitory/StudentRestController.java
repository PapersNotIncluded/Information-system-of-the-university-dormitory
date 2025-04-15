package com.example.studentdormitory;
import jakarta.validation.constraints.Null;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/students")
public class StudentRestController {

    @Autowired
    private StudentService service;

    @RequestMapping("/")
    public String viewHomePage(Model model) {
        return "index";
    }

    @GetMapping
    public Page<Student> getAllStudents(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "group", required = false) String group,
            @RequestParam(name = "room", required = false) Integer room,
            @RequestParam(name = "paid", required = false) Boolean paid,
            @RequestParam(name = "page", defaultValue = "0") Integer page,
            @RequestParam(name = "size", defaultValue = "10") Integer size
    ) {
        return service.listByLastNameOrStudentCard(keyword, group, room, paid, page, size);
    }

    @DeleteMapping("/{id}")
    public void deleteStudent(@PathVariable("id") Long id) {
        service.delete(id);
    }

    @GetMapping("/{id}")
    public Student getStudentById(@PathVariable("id") Long id) {
        return service.get(id);
    }

    @GetMapping("/group")
    public List<String> getGroupIds(){
        return service.listStudentsGroupNums();
    }

    @GetMapping("/room")
    public List<Integer> getRoomNums(){
        return service.listStudentsRoomNums();
    }

    @PostMapping("/add")
    public void postStudent(@RequestBody Student newStudent) {
        service.save(newStudent, newStudent.getStudentCard(), newStudent.getRoom());
    }

    @PutMapping("/{id}")
    public void updateStudent(@PathVariable("id") Long id, @RequestBody Student updatedStudent) {
        Student existingStudent = service.get(id);

        String updatedStudentCard = updatedStudent.getStudentCard();
        Long updatedStudentRoom = updatedStudent.getRoom();

        existingStudent.setLastName(updatedStudent.getLastName());
        existingStudent.setFirstName(updatedStudent.getFirstName());
        existingStudent.setPatronymic(updatedStudent.getPatronymic());
        existingStudent.setGroupNum(updatedStudent.getGroupNum());

        if (updatedStudentRoom != null) {
            existingStudent.setRoom(updatedStudentRoom);
        }

        if (updatedStudentCard != null) {
            existingStudent.setStudentCard(updatedStudentCard);
        }

        existingStudent.setPhone(updatedStudent.getPhone());
        existingStudent.setPaid(updatedStudent.getPaid());

        service.save(existingStudent, updatedStudentCard, updatedStudentRoom);
    }
}