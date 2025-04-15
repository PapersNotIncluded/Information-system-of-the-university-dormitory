package com.example.studentdormitory;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class StudentService {
    @Autowired
    private StudentRepository studentRepo;

    @Autowired
    private RoomRepository roomRepo;

    public Page<Student> listByLastNameOrStudentCard(String keyword, String group, Integer room, Boolean paid, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);

        if (keyword != null || group != null || room != null || paid != null) {
            String preparedKeyword = (keyword != null && !keyword.isEmpty()) ? "%" + keyword.toLowerCase() + "%" : null;
            return studentRepo.searchByLastNameOrStudentCard(preparedKeyword, group, room, paid, pageable);
        }

        return studentRepo.findAll(pageable);
    }

    public List<String> listStudentsGroupNums() {
        return studentRepo.findStudentsGroupNums();
    }

    public List<Integer> listStudentsRoomNums() {
        return studentRepo.findStudentsRoomNums();
    }

    public void save(Student student, String updatedStudentCard, Long updatedStudentRoom) {
        if (updatedStudentCard != null && studentRepo.checkStudentCardExists(student.getStudentCard()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This studentId already exists");
        }

        if (updatedStudentRoom != null) {
            int current = studentRepo.countByRoom(student.getRoom());
            Integer max = roomRepo.getMaxPlacesById(student.getRoom());

            if (max == null) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "The room does not exist");
            }

            if (current >= max) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "The room is full");
            }
        }

        studentRepo.save(student);
    }

    public Student get(Long id) {
        return studentRepo.findById(id).get();
    }

    public void delete(Long id) {
        studentRepo.deleteById(id);
    }
}
